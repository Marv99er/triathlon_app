import { el, SPORT_TYPES, SELECTABLE_SPORTS, formatDuration, averagePace, formatDateShort, formatDateAbbrev, exerciseSummary, toDateInputValue } from './utils.js';
import { icon } from './icons.js';
import { openSheet, showActionMenu, showConfirm, showToast } from './ui.js';
import { db, uuid } from './db.js';
import { parseTCX } from './tcx.js';

let onDataChanged = () => {};
export function setOnDataChanged(fn) { onDataChanged = fn; }

export function sportBadge(sportType, { showsLabel = false, size = 36 } = {}) {
  const sport = SPORT_TYPES[sportType];
  const wrap = el('div', { class: 'sport-badge' });
  const circle = el('div', {
    class: 'sport-badge-icon',
    style: `width:${size}px;height:${size}px;background:${sport.tint}26;color:${sport.tint}`,
    html: icon(sport.icon, { size: Math.round(size * 0.45) }),
  });
  wrap.append(circle);
  if (showsLabel) wrap.append(el('span', { style: 'font-weight:600' }, sport.displayName));
  return wrap;
}

export function workoutRow(workout, onClick) {
  const sport = SPORT_TYPES[workout.sportType];
  const parts = [];
  if (sport.tracksDistance && workout.distanceKm) {
    parts.push(`${workout.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 2 })} km`);
  }
  parts.push(formatDuration(workout.durationSeconds));
  if (workout.sportType === 'strength' && workout.strengthExercises?.length) {
    parts.push(`${workout.strengthExercises.length} Übungen`);
  }
  const pace = averagePace(workout);
  if (pace) parts.push(pace);

  const row = el('div', { class: 'list-row', onclick: onClick }, [
    sportBadge(workout.sportType),
    el('div', { class: 'list-row-main' }, [
      el('div', { class: 'list-row-title' }, workout.routineName || sport.displayName),
      el('div', { class: 'list-row-subtitle' }, parts.join(' · ')),
    ]),
    el('div', { class: 'list-row-trailing' }, [
      el('div', {}, formatDateShort(workout.date)),
      workout.rpe ? el('div', { style: 'font-size:11px;color:var(--text-tertiary)' }, `RPE ${workout.rpe}`) : null,
    ]),
  ]);
  return row;
}

// ---------- "+" Add-Menü: manuell / Garmin-Import ----------

export function openAddWorkoutMenu(anchorEl) {
  const fileInput = el('input', { type: 'file', accept: '.tcx,application/xml,text/xml', style: 'display:none' });
  document.body.append(fileInput);
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.remove();
    if (!file) return;
    try {
      const text = await file.text();
      const draft = parseTCX(text);
      if (!draft) throw new Error('parse failed');
      openWorkoutForm({ prefill: draft });
    } catch {
      showToast('Import fehlgeschlagen: Bitte als TCX aus Garmin Connect exportieren');
    }
  });

  showActionMenu(anchorEl, [
    { label: 'Training eintragen', icon: 'pencil', onClick: () => openWorkoutForm({}) },
    { label: 'Aus Garmin-Datei importieren', icon: 'arrowDownDoc', onClick: () => fileInput.click() },
  ]);
}

// ---------- Trainings-Formular ----------

export function openWorkoutForm({ existingWorkout, prefill }) {
  let sportType = existingWorkout?.sportType || prefill?.sportType || 'run';
  const isEditing = !!existingWorkout;
  let save = null;

  openSheet({
    title: isEditing ? 'Training bearbeiten' : 'Training eintragen',
    saveLabel: 'Sichern',
    onSave: (close) => { if (save) save(close); },
    render(sheet) {
      const durationTotal = existingWorkout?.durationSeconds ?? prefill?.durationSeconds ?? 1800;

      const pickerRow = el('div', { class: 'sport-picker' });
      function renderPicker() {
        pickerRow.innerHTML = '';
        for (const key of SELECTABLE_SPORTS) {
          const sport = SPORT_TYPES[key];
          const active = key === sportType;
          const btn = el('button', {
            class: `sport-picker-item${active ? ' active' : ''}`,
            style: active ? `--tint:${sport.tint};--tint-wash:${sport.tint}26` : '',
            onclick: () => { sportType = key; renderPicker(); },
          }, [
            el('div', { html: icon(sport.icon, { size: 18 }) }),
            el('span', {}, sport.displayName),
          ]);
          pickerRow.append(btn);
        }
      }
      renderPicker();

      const dateInput = el('input', { type: 'date', value: toDateInputValue(existingWorkout?.date || prefill?.date || new Date()) });
      const minInput = el('input', { type: 'number', value: Math.floor(durationTotal / 60) });
      const secInput = el('input', { type: 'number', value: durationTotal % 60 });
      const distanceInput = el('input', { type: 'number', step: '0.01', placeholder: 'z. B. 10.5', value: existingWorkout?.distanceKm ?? prefill?.distanceKm ?? '' });
      const avgHrInput = el('input', { type: 'number', placeholder: 'bpm', value: existingWorkout?.avgHeartRate ?? prefill?.avgHeartRate ?? '' });
      const maxHrInput = el('input', { type: 'number', placeholder: 'bpm', value: existingWorkout?.maxHeartRate ?? prefill?.maxHeartRate ?? '' });
      let rpe = existingWorkout?.rpe ?? 5;
      const rpeLabel = el('span', {}, `Anstrengung (RPE ${rpe}/10)`);
      const rpeInput = el('input', { type: 'range', min: 1, max: 10, step: 1, value: rpe });
      rpeInput.addEventListener('input', () => { rpe = Number(rpeInput.value); rpeLabel.textContent = `Anstrengung (RPE ${rpe}/10)`; });
      const notesInput = el('textarea', { placeholder: 'Wie ist es gelaufen?' }, existingWorkout?.notes || '');

      sheet.body.append(
        el('div', { class: 'section-title' }, 'Sportart'),
        el('div', { class: 'form-group' }, pickerRow),

        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Wann'),
        el('div', { class: 'form-group' }, [
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Datum'), dateInput]),
        ]),

        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Umfang'),
        el('div', { class: 'form-group' }, [
          el('div', { class: 'form-row' }, [
            el('label', { class: 'form-label' }, 'Dauer'), minInput, el('span', { class: 'unit-suffix' }, 'min'), secInput, el('span', { class: 'unit-suffix' }, 'sek'),
          ]),
          el('div', { class: 'form-row' }, [
            el('label', { class: 'form-label' }, 'Distanz'), distanceInput, el('span', { class: 'unit-suffix' }, 'km'),
          ]),
        ]),

        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Puls (optional)'),
        el('div', { class: 'form-group' }, [
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Ø Herzfrequenz'), avgHrInput]),
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Max. Herzfrequenz'), maxHrInput]),
        ]),

        el('div', { class: 'section-title', style: 'margin-top:20px' }, rpeLabel),
        el('div', { class: 'form-group' }, [el('div', { class: 'form-row' }, rpeInput)]),

        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Notizen'),
        el('div', { class: 'form-group' }, [el('div', { class: 'form-row' }, notesInput)]),
      );

      save = async (close) => {
        const durMin = Math.max(0, parseInt(minInput.value, 10) || 0);
        const durSec = Math.max(0, Math.min(59, parseInt(secInput.value, 10) || 0));
        const workout = existingWorkout || {
          id: uuid(), strengthExercises: [], routineName: null, bodyWeightKg: null,
        };
        workout.sportType = sportType;
        workout.date = new Date(dateInput.value + 'T12:00:00').toISOString();
        workout.durationSeconds = durMin * 60 + durSec;
        workout.distanceKm = distanceInput.value ? parseFloat(distanceInput.value) : null;
        workout.avgHeartRate = avgHrInput.value ? parseInt(avgHrInput.value, 10) : null;
        workout.maxHeartRate = maxHrInput.value ? parseInt(maxHrInput.value, 10) : null;
        workout.rpe = rpe;
        workout.notes = notesInput.value.trim() || null;
        await db.put('workouts', workout);
        onDataChanged();
        close();
      };
    },
  });
}

// ---------- Trainings-Detail ----------

export function openWorkoutDetail(workout) {
  const sheet = openSheet({
    title: workout.routineName || SPORT_TYPES[workout.sportType].displayName,
    leftLabel: 'Fertig',
    rightIcon: 'ellipsis',
    onRightIconClick: (e, close) => {
      const items = [{ label: 'Bearbeiten', icon: 'pencil', onClick: () => {
        close();
        if (workout.sportType === 'strength') {
          import('./strength.js').then(m => m.openStrengthSessionForm({ existingWorkout: workout }));
        } else {
          openWorkoutForm({ existingWorkout: workout });
        }
      } }];
      if (workout.sportType === 'strength') {
        items.push({ label: 'Training wiederholen', icon: 'repeat', onClick: () => {
          close();
          import('./strength.js').then(m => m.openStrengthSessionForm({ repeatFrom: workout }));
        } });
      }
      showActionMenu(e.currentTarget, items);
    },
    render(s) {
      const sport = SPORT_TYPES[workout.sportType];
      const rows = [];
      rows.push(['Dauer', formatDuration(workout.durationSeconds)]);
      if (sport.tracksDistance && workout.distanceKm) rows.push(['Distanz', `${workout.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 2 })} km`]);
      const pace = averagePace(workout);
      if (pace) rows.push([workout.sportType === 'bike' ? 'Ø Geschwindigkeit' : 'Ø Pace', pace]);
      if (workout.bodyWeightKg) rows.push(['Körpergewicht', `${workout.bodyWeightKg.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kg`]);
      if (workout.avgHeartRate) rows.push(['Ø Herzfrequenz', `${workout.avgHeartRate} bpm`]);
      if (workout.maxHeartRate) rows.push(['Max. Herzfrequenz', `${workout.maxHeartRate} bpm`]);
      if (workout.rpe) rows.push(['Anstrengung (RPE)', `${workout.rpe}/10`]);

      s.body.append(
        el('div', { class: 'card', style: 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px' }, [
          sportBadge(workout.sportType, { showsLabel: true, size: 44 }),
          el('span', { class: 'text-secondary' }, formatDateAbbrev(workout.date)),
        ]),
        el('div', { class: 'section-title' }, 'Kennzahlen'),
        el('div', { class: 'form-group' }, rows.map(([label, value]) =>
          el('div', { class: 'form-row' }, [el('span', {}, label), el('span', { class: 'text-secondary' }, value)])
        )),
      );

      if (workout.sportType === 'strength' && workout.strengthExercises?.length) {
        const sorted = [...workout.strengthExercises].sort((a, b) => a.order - b.order);
        s.body.append(
          el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Übungen'),
          el('div', { class: 'form-group' }, sorted.map(ex => el('div', { class: 'form-row form-row-vertical' }, [
            el('div', { style: 'font-weight:600' }, ex.name),
            el('div', { class: 'text-secondary', style: 'font-size:13px' }, exerciseSummary(ex)),
            ex.notes ? el('div', { style: 'font-size:12px;color:var(--text-tertiary)' }, ex.notes) : null,
          ]))),
        );
      }

      if (workout.notes) {
        s.body.append(
          el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Notizen'),
          el('div', { class: 'card' }, workout.notes),
        );
      }

      s.body.append(
        el('button', {
          class: 'btn btn-destructive btn-block', style: 'margin-top:24px',
          onclick: () => showConfirm({
            title: 'Training wirklich löschen?',
            actions: [{ label: 'Löschen', destructive: true, onClick: async () => {
              await db.delete('workouts', workout.id);
              onDataChanged();
              s.close();
            } }],
          }),
        }, 'Training löschen'),
      );
    },
  });
}

// ---------- Log-Tab (Verlauf) ----------

export async function renderLogPage(container) {
  const workouts = (await db.getAll('workouts')).sort((a, b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = '';

  const addBtn = el('button', { class: 'navbar-btn', html: icon('plus', { size: 22 }) });
  addBtn.addEventListener('click', () => openAddWorkoutMenu(addBtn));

  container.append(
    el('div', { class: 'navbar' }, [
      el('div', { class: 'navbar-row' }, [
        el('div', { class: 'navbar-spacer' }),
        el('div', { class: 'navbar-title' }, 'Log'),
        addBtn,
      ]),
    ]),
  );

  if (workouts.length === 0) {
    container.append(emptyState('Noch keine Trainings', 'Trage dein erstes Training ein, um deinen Verlauf zu sehen.', addBtn));
    return;
  }

  const groups = new Map();
  for (const w of workouts) {
    const key = new Date(w.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }

  const content = el('div', { class: 'content' });
  for (const [month, items] of groups) {
    content.append(
      el('div', { class: 'section-title' }, month),
      el('div', { class: 'list' }, items.map(w => workoutRow(w, () => openWorkoutDetail(w)))),
    );
  }
  container.append(content);
}

export function emptyState(title, message, triggerBtn, iconName = 'list', actionLabel = 'Training hinzufügen') {
  return el('div', { class: 'empty-state' }, [
    el('div', { html: icon(iconName, { size: 40 }) }),
    el('h3', {}, title),
    el('p', {}, message),
    el('button', { class: 'btn btn-primary', style: 'margin-top:10px', onclick: () => triggerBtn?.click() }, actionLabel),
  ]);
}
