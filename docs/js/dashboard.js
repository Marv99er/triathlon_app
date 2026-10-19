import { el, SPORT_TYPES, startOfWeek, endOfWeek, formatDateShort, formatNumber } from './utils.js';
import { icon } from './icons.js';
import { db } from './db.js';
import { openSettingsSheet } from './settings.js';
import { openAddWorkoutMenu, openWorkoutDetail, workoutRow } from './log.js';

export async function renderDashboardPage(container) {
  const allWorkouts = (await db.getAll('workouts')).sort((a, b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = '';

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeek = allWorkouts.filter(w => { const d = new Date(w.date); return d >= weekStart && d < weekEnd; });
  const recent = allWorkouts.slice(0, 3);

  const settingsBtn = el('button', { class: 'navbar-btn', html: icon('gear', { size: 20 }), onclick: openSettingsSheet });
  const addBtn = el('button', { class: 'navbar-btn', html: icon('plus', { size: 22 }) });
  addBtn.addEventListener('click', () => openAddWorkoutMenu(addBtn));

  container.append(
    el('div', { class: 'navbar' }, [
      el('div', { class: 'navbar-row' }, [settingsBtn, el('div', { class: 'navbar-title' }, 'Übersicht'), addBtn]),
    ]),
  );

  const content = el('div', { class: 'content' });

  const endDisplay = new Date(weekEnd.getTime() - 1);
  content.append(
    el('div', {}, [
      el('div', { style: 'font-size:22px;font-weight:700' }, 'Diese Woche'),
      el('div', { class: 'text-secondary', style: 'font-size:14px;margin-top:2px' }, `${formatDateShort(weekStart)} – ${formatDateShort(endDisplay)}`),
    ]),
  );

  if (thisWeek.length) {
    const totalSeconds = thisWeek.reduce((sum, w) => sum + w.durationSeconds, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const totalText = hours > 0 ? `${hours} Std ${minutes} min` : `${minutes} min`;
    content.append(
      el('div', { class: 'hero-card' }, [
        el('div', { class: 'label' }, 'Gesamtzeit'),
        el('div', { class: 'value' }, totalText),
      ]),
    );
  }

  const grid = el('div', { class: 'stat-grid' });
  for (const key of Object.keys(SPORT_TYPES)) {
    const sport = SPORT_TYPES[key];
    const sportWorkouts = thisWeek.filter(w => w.sportType === key);
    const totalMinutes = Math.floor(sportWorkouts.reduce((s, w) => s + w.durationSeconds, 0) / 60);
    let value;
    if (sportWorkouts.length === 0) {
      value = '–';
    } else if (sport.tracksDistance) {
      const totalDistance = sportWorkouts.reduce((s, w) => s + (w.distanceKm || 0), 0);
      value = totalDistance > 0 ? `${formatNumber(totalDistance, 0, 1)} km` : `${totalMinutes} min`;
    } else {
      value = `${totalMinutes} min`;
    }
    grid.append(
      el('div', { class: 'stat-tile' }, [
        el('div', { style: `color:${sport.tint}`, html: icon(sport.icon, { size: 18 }) }),
        el('div', { class: 'stat-tile-value' }, value),
        el('div', { class: 'stat-tile-label' }, sport.displayName),
      ]),
    );
  }
  content.append(grid);

  if (recent.length) {
    content.append(
      el('div', { class: 'card' }, [
        el('div', { style: 'font-weight:600;margin-bottom:10px' }, 'Letzte Trainings'),
        el('div', { style: 'display:flex;flex-direction:column' }, recent.map((w, i) => {
          const row = workoutRow(w, () => openWorkoutDetail(w));
          row.style.borderBottom = i < recent.length - 1 ? '0.5px solid var(--separator)' : 'none';
          row.style.padding = '10px 0';
          return row;
        })),
      ]),
    );
  }

  if (allWorkouts.length === 0) {
    content.append(
      el('div', { class: 'empty-state' }, [
        el('div', { html: icon('run', { size: 40 }) }),
        el('h3', {}, 'Willkommen bei TriLog'),
        el('p', {}, 'Trage dein erstes Training ein, um loszulegen.'),
        el('button', { class: 'btn btn-primary', style: 'margin-top:10px', onclick: () => addBtn.click() }, 'Training hinzufügen'),
      ]),
    );
  }

  container.append(content);
}
