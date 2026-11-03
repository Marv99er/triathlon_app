import { el, SPORT_TYPES, WEEKDAY_SHORT, startOfWeek, endOfWeek, startOfDay, formatDateShort, formatDistance, formatHours, isoWeekNumber } from './utils.js';
import { icon } from './icons.js';
import { db } from './db.js';
import { fab, showActionMenu } from './ui.js';
import { openSettingsSheet } from './settings.js';
import { openAddWorkoutMenu, openWorkoutDetail, workoutRow } from './log.js';
import { raceBib, nextRace } from './competitions.js';

const setCount = (w) => (w.strengthExercises || []).reduce((s, e) => s + e.sets.length, 0);

// Kappengröße wächst mit dem Umfang (Kraft: Sätze, sonst Dauer), gedeckelt, damit lange Radeinheiten den Slot nicht sprengen
function capSize(w) {
  if (w.sportType === 'strength' && setCount(w)) return Math.round(Math.min(44, 16 + setCount(w) * 1.3));
  return Math.round(Math.min(44, Math.max(16, 12 + Math.sqrt(w.durationSeconds / 60) * 2.6)));
}

function sumBy(list, fn) { return list.reduce((s, w) => s + (fn(w) || 0), 0); }

// Maß je Sportart, für beide Wochen gleich gewählt: Kraft in Sätzen, Schwimmen/Rad/Lauf in Distanz, sonst Zeit
function measureFor(key, lists) {
  const all = lists.flat();
  if (key === 'strength' && sumBy(all, setCount) > 0) {
    return { of: (l) => sumBy(l, setCount), fmt: (n) => `${n} ${n === 1 ? 'Satz' : 'Sätze'}` };
  }
  if (SPORT_TYPES[key].tracksDistance && sumBy(all, w => w.distanceKm) > 0) {
    return { of: (l) => sumBy(l, w => w.distanceKm), fmt: (n) => formatDistance(key, n) };
  }
  return { of: (l) => sumBy(l, w => w.durationSeconds), fmt: (n) => formatHours(n) };
}

export async function renderDashboardPage(container) {
  const [allWorkouts, competitions] = await Promise.all([db.getAll('workouts'), db.getAll('competitions')]);
  allWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = '';

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const lastWeekStart = new Date(weekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const inRange = (w, a, b) => { const d = new Date(w.date); return d >= a && d < b; };
  const thisWeek = allWorkouts.filter(w => inRange(w, weekStart, weekEnd));
  const lastWeek = allWorkouts.filter(w => inRange(w, lastWeekStart, weekStart));
  // Fairer Vergleich: Vorwoche nur bis zum gleichen Wochentag (Ende des heutigen Tages)
  const sameDayLastWeek = new Date(startOfDay(now)); sameDayLastWeek.setDate(sameDayLastWeek.getDate() - 6);
  const lastWeekToDate = lastWeek.filter(w => new Date(w.date) < sameDayLastWeek);
  const todayShort = WEEKDAY_SHORT[(now.getDay() + 6) % 7];

  const settingsBtn = el('button', { class: 'navbar-btn quiet', 'aria-label': 'Einstellungen', html: icon('gear', { size: 22 }), onclick: openSettingsSheet });
  const endDisplay = new Date(weekEnd.getTime() - 1);
  container.append(
    el('div', { class: 'navbar' }, [
      el('div', { class: 'navbar-row' }, [
        el('h1', { class: 'navbar-title', style: 'margin:0' }, `Woche ${isoWeekNumber(now)}`),
        el('span', { class: 'navbar-subtitle' }, `${formatDateShort(weekStart)} – ${formatDateShort(endDisplay)}`),
        settingsBtn,
      ]),
    ]),
  );

  const content = el('div', { class: 'content' });

  // 1. Startnummer: das nächste Rennen
  content.append(raceBib(nextRace(competitions)));

  // 2. Wechselzone: die Woche als Rack mit sieben Plätzen
  const totalThis = sumBy(thisWeek, w => w.durationSeconds);
  const totalLast = sumBy(lastWeek, w => w.durationSeconds);
  const today = startOfDay(now);
  const slots = el('div', { class: 'rack-slots' });
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart); day.setDate(day.getDate() + i);
    const next = new Date(day); next.setDate(next.getDate() + 1);
    const sessions = thisWeek.filter(w => inRange(w, day, next)).sort((a, b) => new Date(a.date) - new Date(b.date));
    const isToday = day.getTime() === today.getTime();
    const isFuture = day > today;

    const caps = el('div', { class: 'rack-caps' });
    if (sessions.length) {
      for (const w of sessions) {
        const size = capSize(w);
        caps.append(el('span', { class: 'cap', style: `width:${size}px;height:${size}px;background:${SPORT_TYPES[w.sportType].tint}` }));
      }
    } else if (isFuture) {
      caps.append(el('span', { class: 'cap future' }));
    } else {
      caps.append(el('span', { class: 'cap empty', style: 'width:18px;height:18px' }));
    }

    const label = sessions.length
      ? `${WEEKDAY_SHORT[i]}: ${sessions.map(w => w.routineName || SPORT_TYPES[w.sportType].displayName).join(', ')}`
      : `${WEEKDAY_SHORT[i]}: kein Training`;
    const slot = el('button', {
      class: `rack-slot${isToday ? ' today' : ''}`,
      'aria-label': label,
      onclick: () => {
        if (sessions.length === 1) openWorkoutDetail(sessions[0]);
        else if (sessions.length > 1) showActionMenu(slot, sessions.map(w => ({
          label: w.routineName || SPORT_TYPES[w.sportType].displayName, icon: SPORT_TYPES[w.sportType].icon,
          onClick: () => openWorkoutDetail(w),
        })));
      },
    }, [
      el('span', { class: 'rack-no' }, String(i + 1)),
      el('span', { class: 'rack-hook' }),
      caps,
      el('span', { class: 'rack-day' }, WEEKDAY_SHORT[i]),
    ]);
    if (!sessions.length) slot.disabled = true;
    slots.append(slot);
  }

  content.append(
    el('section', {}, [
      el('h2', { class: 'section-title', style: 'margin:0' }, [
        el('span', {}, 'Wechselzone'),
        el('span', { class: 'aside' }, `${formatHours(totalThis)}${totalLast ? ` · Vorwoche ${formatHours(totalLast)}` : ''}`),
      ]),
      el('div', { class: 'rack' }, [slots]),
    ]),
  );

  // 3. Je Disziplin: Stand dieser Woche gegen die Vorwoche bis zum gleichen Tag
  const lines = el('div', { class: 'list' });
  for (const key of Object.keys(SPORT_TYPES)) {
    const sport = SPORT_TYPES[key];
    const mine = thisWeek.filter(w => w.sportType === key);
    const prev = lastWeekToDate.filter(w => w.sportType === key);
    const unit = measureFor(key, [mine, prev]);
    const now_ = unit.of(mine);
    const diff = now_ - unit.of(prev);

    const value = mine.length ? unit.fmt(now_) : '–';
    // Ein Vergleich ist nur sinnvoll, wenn beide Wochen etwas haben
    const prevText = !prev.length ? `Vorwoche bis ${todayShort}: nichts`
      : !mine.length ? `Vorwoche bis ${todayShort}: ${unit.fmt(unit.of(prev))}`
      : unit.fmt(now_) === unit.fmt(unit.of(prev)) ? `wie Vorwoche bis ${todayShort}`
      : `${diff > 0 ? '+' : '−'}${unit.fmt(Math.abs(diff))} ggü. Vorwoche bis ${todayShort}`;
    const exercises = sumBy(mine, w => (w.strengthExercises || []).length);
    const meta = !mine.length ? 'noch offen'
      : key === 'strength' && exercises ? `${mine.length} ${mine.length === 1 ? 'Einheit' : 'Einheiten'} · ${exercises} Übungen`
      : `${mine.length} ${mine.length === 1 ? 'Einheit' : 'Einheiten'} · ${formatHours(sumBy(mine, w => w.durationSeconds))}`;

    lines.append(
      el('div', { class: `sport-line${mine.length ? '' : ' idle'}` }, [
        el('span', { class: `cap${mine.length ? '' : ' empty'}`, style: mine.length ? `background:${sport.tint}` : `border-color:${sport.tint}` }),
        el('div', {}, [
          el('div', { class: 'sport-line-name' }, sport.displayName),
          el('div', { class: 'sport-line-meta' }, meta),
        ]),
        el('div', { class: 'sport-line-value' }, [
          el('div', { class: 'v' }, value),
          el('div', { class: 'prev' }, prevText),
        ]),
      ]),
    );
  }
  content.append(
    el('section', {}, [
      el('h2', { class: 'section-title', style: 'margin:0' }, 'Je Disziplin'),
      lines,
    ]),
  );

  // 4. Zuletzt und der Plan vom Coach
  const recent = allWorkouts.slice(0, 3);
  const planRow = el('div', { class: 'list-row', role: 'button', tabindex: '0', onclick: () => window.dispatchEvent(new CustomEvent('trilog-show-page', { detail: 'plan' })) }, [
    el('span', { html: icon('calendar', { size: 22 }), style: 'color:var(--text-secondary);display:flex' }),
    el('div', { class: 'list-row-main' }, [el('div', { class: 'list-row-title' }, 'Trainingsplan vom Coach')]),
    el('span', { class: 'list-row-chevron', html: icon('chevronRight', { size: 20 }) }),
  ]);

  if (recent.length) {
    content.append(
      el('section', {}, [
        el('h2', { class: 'section-title', style: 'margin:0' }, 'Zuletzt'),
        el('div', { class: 'list' }, [...recent.map(w => workoutRow(w, () => openWorkoutDetail(w))), planRow]),
      ]),
    );
  } else {
    content.append(
      el('div', { class: 'empty-state', style: 'padding:24px 16px' }, [
        el('h3', {}, 'Die Wechselzone ist noch leer'),
        el('p', {}, 'Trag dein erstes Training ein oder verbinde Garmin in den Einstellungen, dann füllt sich die Woche von selbst.'),
      ]),
      el('div', { class: 'list' }, [planRow]),
    );
  }

  container.append(content);

  fab('Training hinzufügen', openAddWorkoutMenu);
}
