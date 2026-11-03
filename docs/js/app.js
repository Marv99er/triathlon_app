import { el } from './utils.js';
import { showToast, triggerPrimaryAction } from './ui.js';
import { syncIntervals } from './intervals.js';
import { icon } from './icons.js';
import { applyStoredTheme } from './settings.js';
import { renderDashboardPage } from './dashboard.js';
import { renderPlanPage } from './plan.js';
import { renderLogPage, setOnDataChanged as setLogDataChanged } from './log.js';
import { renderStrengthPage, setOnDataChanged as setStrengthDataChanged } from './strength.js';
import { renderCompetitionsPage, setOnDataChanged as setCompetitionsDataChanged } from './competitions.js';

applyStoredTheme();

// Der Trainingsplan ist keine eigene Hauptrubrik mehr: er öffnet sich aus der Woche heraus (inTabbar: false).
const TABS = [
  { id: 'dashboard', label: 'Woche', icon: 'house', render: renderDashboardPage },
  { id: 'log', label: 'Log', icon: 'list', render: renderLogPage },
  { id: 'strength', label: 'Kraft', icon: 'strength', render: renderStrengthPage },
  { id: 'competitions', label: 'Rennen', icon: 'trophy', render: renderCompetitionsPage },
  { id: 'plan', label: 'Plan', icon: 'calendar', render: renderPlanPage, inTabbar: false, parent: 'dashboard' },
];

const tabbar = document.getElementById('tabbar');
tabbar.innerHTML = '';
TABS.filter(t => t.inTabbar !== false).forEach((tab, i) => {
  if (i === 2) {
    tabbar.append(el('button', {
      id: 'primary-action', class: 'tab-primary', 'aria-label': 'Hinzufügen',
      html: icon('plus', { size: 30, stroke: 2.5 }),
      onclick: (e) => triggerPrimaryAction(e.currentTarget),
    }));
  }
  tabbar.append(el('button', { class: 'tab-item', 'data-page': tab.id, onclick: () => showPage(tab.id) }, [
    el('span', { html: icon(tab.icon, { size: 24 }), 'aria-hidden': 'true' }),
    el('span', {}, tab.label),
  ]));
});

let activePage = 'dashboard';

async function showPage(id) {
  activePage = id;
  const tab = TABS.find(t => t.id === id);
  const highlighted = tab.parent || id;
  for (const t of TABS) {
    document.getElementById(`page-${t.id}`).classList.toggle('active', t.id === id);
    const btn = tabbar.querySelector(`[data-page="${t.id}"]`);
    if (btn) {
      btn.classList.toggle('active', t.id === highlighted);
      btn.setAttribute('aria-current', t.id === highlighted ? 'page' : 'false');
    }
  }
  await tab.render(document.getElementById(`page-${id}`));
}

window.addEventListener('trilog-show-page', (e) => showPage(e.detail));

function refreshActivePage() { showPage(activePage); }

setLogDataChanged(refreshActivePage);
setStrengthDataChanged(refreshActivePage);
setCompetitionsDataChanged(refreshActivePage);

showPage('dashboard');

// Garmin-Abgleich beim Öffnen und beim Zurückkehren in die App; leise, außer bei falschem Schlüssel.
async function syncGarmin() {
  try {
    const { changed } = await syncIntervals();
    if (changed) refreshActivePage();
  } catch (e) {
    if (e.message === 'auth') showToast('Garmin-Abgleich: API-Schlüssel ungültig');
  }
}
window.addEventListener('trilog-data-changed', refreshActivePage);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncGarmin(); });
syncGarmin();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
