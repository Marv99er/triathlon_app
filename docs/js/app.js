import { el } from './utils.js';
import { showToast } from './ui.js';
import { syncIntervals } from './intervals.js';
import { icon } from './icons.js';
import { applyStoredTheme } from './settings.js';
import { renderDashboardPage } from './dashboard.js';
import { renderPlanPage } from './plan.js';
import { renderLogPage, setOnDataChanged as setLogDataChanged } from './log.js';
import { renderStrengthPage, setOnDataChanged as setStrengthDataChanged } from './strength.js';
import { renderCompetitionsPage, setOnDataChanged as setCompetitionsDataChanged } from './competitions.js';

applyStoredTheme();

const TABS = [
  { id: 'dashboard', label: 'Übersicht', icon: 'house', render: renderDashboardPage },
  { id: 'plan', label: 'Plan', icon: 'calendar', render: renderPlanPage },
  { id: 'log', label: 'Log', icon: 'list', render: renderLogPage },
  { id: 'strength', label: 'Kraft', icon: 'strength', render: renderStrengthPage },
  { id: 'competitions', label: 'Wettkämpfe', icon: 'trophy', render: renderCompetitionsPage },
];

const tabbar = document.getElementById('tabbar');
tabbar.innerHTML = '';
for (const tab of TABS) {
  const btn = el('button', { class: 'tab-item', 'data-page': tab.id, onclick: () => showPage(tab.id) }, [
    el('span', { html: icon(tab.icon, { size: 22 }) }),
    el('span', {}, tab.label),
  ]);
  tabbar.append(btn);
}

let activePage = 'dashboard';

async function showPage(id) {
  activePage = id;
  for (const tab of TABS) {
    document.getElementById(`page-${tab.id}`).classList.toggle('active', tab.id === id);
    tabbar.querySelector(`[data-page="${tab.id}"]`).classList.toggle('active', tab.id === id);
  }
  const tab = TABS.find(t => t.id === id);
  await tab.render(document.getElementById(`page-${id}`));
}

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
