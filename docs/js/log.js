import { el, SPORT_TYPES, SELECTABLE_SPORTS, formatDuration, formatDistance, averagePace, formatDateShort, formatDateAbbrev, exerciseSummary, toDateInputValue } from './utils.js';
import { icon } from './icons.js';
import { openSheet, showActionMenu, showConfirm, showToast, durationRow, fab } from './ui.js';
import { db, uuid } from './db.js';
import { parseTCX } from './tcx.js';
import { ignoreIntervalsActivity } from './intervals.js';

let onDataChanged = () => {};
export function setOnDataChanged(fn) { onDataChanged = fn; }

export function sportBadge(sportType, { showsLabel = false, size = 36 } = {}) {
  const sport = SPORT_TYPES[sportType];
  const wrap = el('div', { class: 'sport-badge' });
  const circle = el('div', {
    class: 'sport-badge-icon',
    style: `width:${size}px;height:${size}px;background:color-mix(in srgb, ${sport.tint} 18%, transparent);color:${sport.tint}`,
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
    parts.push(formatDistance(workout.sportType, workout.distanceKm));
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
      workout.rpe ? el('div', { style: 'font-size:13px;margin-top:2px', title: 'Anstrengung (RPE 1–10)' }, `RPE ${workout.rpe}`) : null,
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

export function rpeText(rpe) {
  const feel = rpe <= 3 ? 'locker' : rpe <= 6 ? 'mittel' : rpe <= 8 ? 'hart' : 'maximal';
  return `Anstrengung ${rpe}/10 · ${feel}`;
}

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
      // Schwimmen in Metern, Rad und Lauf in Kilometern; gespeichert wird immer in km
      let distanceKm = existingWorkout?.distanceKm ?? prefill?.distanceKm ?? null;
      const distanceInput = el('input', { type: 'number', inputmode: 'decimal' });
      const distanceUnit = el('span', { class: 'unit-suffix' });
      const isMeters = () => sportType === 'swim';
      distanceInput.addEventListener('input', () => {
        const v = parseFloat(distanceInput.value);
        distanceKm = Number.isFinite(v) ? (isMeters() ? v / 1000 : v) : null;
      });
      function applyDistanceUnit() {
        distanceUnit.textContent = isMeters() ? 'm' : 'km';
        distanceInput.placeholder = isMeters() ? 'z. B. 2000' : 'z. B. 10,5';
        distanceInput.step = isMeters() ? '25' : '0.01';
        distanceInput.value = distanceKm == null ? '' : isMeters() ? Math.round(distanceKm * 1000) : Math.round(distanceKm * 100) / 100;
      }

      function renderPicker() {
        pickerRow.innerHTML = '';
        for (const key of SELECTABLE_SPORTS) {
          const sport = SPORT_TYPES[key];
          const active = key === sportType;
          const btn = el('button', {
            class: `sport-picker-item${active ? ' active' : ''}`,
            style: active ? `--tint:${sport.tint}` : '',
            'aria-pressed': active ? 'true' : 'false',
            onclick: () => { sportType = key; renderPicker(); applyDistanceUnit(); },
          }, [
            el('div', { html: icon(sport.icon, { size: 22 }) }),
            el('span', {}, sport.displayName),
          ]);
          pickerRow.append(btn);
        }
      }
      renderPicker();
      applyDistanceUnit();

      const dateInput = el('input', { type: 'date', value: toDateInputValue(existingWorkout?.date || prefill?.date || new Date()) });
      const duration = durationRow('Dauer', durationTotal);

      const avgHrInput = el('input', { type: 'number', inputmode: 'numeric', placeholder: 'bpm', value: existingWorkout?.avgHeartRate ?? prefill?.avgHeartRate ?? '' });
      const maxHrInput = el('input', { type: 'number', inputmode: 'numeric', placeholder: 'bpm', value: existingWorkout?.maxHeartRate ?? prefill?.maxHeartRate ?? '' });
      let rpe = existingWorkout?.rpe ?? 5;
      const rpeLabel = el('span', {}, rpeText(rpe));
      const rpeInput = el('input', { type: 'range', min: 1, max: 10, step: 1, value: rpe, 'aria-label': 'Anstrengung 1 bis 10' });
      rpeInput.addEventListener('input', () => { rpe = Number(rpeInput.value); rpeLabel.textContent = rpeText(rpe); });
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
          duration.row,
          el('div', { class: 'form-row' }, [
            el('label', { class: 'form-label' }, 'Distanz'), distanceInput, distanceUnit,
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
        const workout = existingWorkout || {
          id: uuid(), strengthExercises: [], routineName: null, bodyWeightKg: null,
        };
        workout.sportType = sportType;
        workout.date = new Date(dateInput.value + 'T12:00:00').toISOString();
        workout.durationSeconds = duration.read();
        workout.distanceKm = distanceKm;
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
  const isStrength = workout.sportType === 'strength';
  const sheet = openSheet({
    title: workout.routineName || SPORT_TYPES[workout.sportType].displayName,
    leftLabel: 'Fertig',
    saveLabel: 'Bearbeiten',
    onSave: (close) => {
      close();
      if (isStrength) import('./strength.js').then(m => m.openStrengthSessionForm({ existingWorkout: workout }));
      else openWorkoutForm({ existingWorkout: workout });
    },
    render(s) {
      const sport = SPORT_TYPES[workout.sportType];
      const headline = sport.tracksDistance && workout.distanceKm
        ? formatDistance(workout.sportType, workout.distanceKm)
        : formatDuration(workout.durationSeconds);
      const rows = [];
      if (sport.tracksDistance && workout.distanceKm) rows.push(['Dauer', formatDuration(workout.durationSeconds)]);
      const pace = averagePace(workout);
      if (pace) rows.push([workout.sportType === 'bike' ? 'Ø Geschwindigkeit' : 'Ø Pace', pace]);
      if (workout.bodyWeightKg) rows.push(['Körpergewicht', `${workout.bodyWeightKg.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kg`]);
      if (workout.avgHeartRate) rows.push(['Ø Herzfrequenz', `${workout.avgHeartRate} bpm`]);
      if (workout.maxHeartRate) rows.push(['Max. Herzfrequenz', `${workout.maxHeartRate} bpm`]);
      if (workout.rpe) rows.push(['Anstrengung', rpeText(workout.rpe).replace('Anstrengung ', '')]);
      if (workout.intervalsId) rows.push(['Quelle', 'Garmin Connect']);

      s.body.append(
        el('div', { style: 'display:flex;align-items:center;gap:14px;margin:4px 0 20px' }, [
          sportBadge(workout.sportType, { size: 52 }),
          el('div', {}, [
            el('div', { class: 'figure', style: 'font-size:40px;font-weight:800;line-height:1' }, headline),
            el('div', { class: 'text-secondary', style: 'margin-top:4px' }, `${sport.displayName} · ${formatDateAbbrev(workout.date)}`),
          ]),
        ]),
        rows.length ? el('div', { class: 'form-group' }, rows.map(([label, value]) =>
          el('div', { class: 'form-row' }, [el('span', { class: 'form-label' }, label), el('span', { style: 'font-weight:600' }, value)])
        )) : null,
      );

      if (isStrength) {
        s.body.append(el('button', {
          class: 'btn btn-secondary btn-block', style: 'margin-top:16px',
          onclick: () => { s.close(); import('./strength.js').then(m => m.openStrengthSessionForm({ repeatFrom: workout })); },
        }, [el('span', { html: icon('repeat', { size: 18 }), style: 'display:flex' }), 'Training wiederholen']));
      }

      if (workout.sportType === 'strength' && workout.strengthExercises?.length) {
        const sorted = [...workout.strengthExercises].sort((a, b) => a.order - b.order);
        s.body.append(
          el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Übungen'),
          el('div', { class: 'form-group' }, sorted.map(ex => el('div', { class: 'form-row form-row-vertical' }, [
            el('div', { style: 'font-weight:600' }, ex.name),
            el('div', { class: 'text-secondary', style: 'font-size:15px' }, exerciseSummary(ex)),
            ex.notes ? el('div', { class: 'text-secondary', style: 'font-size:14px;font-style:italic' }, ex.notes) : null,
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
              ignoreIntervalsActivity(workout.intervalsId);
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

  const addBtn = fab('Training hinzufügen', openAddWorkoutMenu);

  container.append(
    el('div', { class: 'navbar' }, [
      el('div', { class: 'navbar-row' }, [el('h1', { class: 'navbar-title', style: 'margin:0' }, 'Log')]),
    ]),
  );

  if (workouts.length === 0) {
    container.append(emptyState('Noch keine Trainings', 'Trag dein erstes Training ein oder verbinde Garmin in den Einstellungen.', addBtn));
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
      el('section', {}, [
        el('h2', { class: 'section-title', style: 'margin:0' }, month),
        el('div', { class: 'list' }, items.map(w => workoutRow(w, () => openWorkoutDetail(w)))),
      ]),
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
