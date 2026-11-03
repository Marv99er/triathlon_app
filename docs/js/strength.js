import { el, WEEKDAY_NAMES, WEEKDAY_SHORT, weekdayFromDate, startOfMonth, endOfMonth, formatMonthYear, formatDateAbbrev, formatDateShort, exerciseSummary, toDateTimeInputValue } from './utils.js';
import { icon } from './icons.js';
import { openSheet, showActionMenu, showConfirm, fab } from './ui.js';
import { db, uuid } from './db.js';
import { rpeText } from './log.js';

let onDataChanged = () => {};
export function setOnDataChanged(fn) { onDataChanged = fn; }

// ---------- Kraft-Tab: Wochenplan ----------

export async function renderStrengthPage(container) {
  const routines = (await db.getAll('routines')).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  container.innerHTML = '';

  container.append(
    el('div', { class: 'navbar' }, [
      el('div', { class: 'navbar-row' }, [el('h1', { class: 'navbar-title', style: 'margin:0' }, 'Kraft')]),
    ]),
  );
  fab('Freies Krafttraining starten', () => openStrengthSessionForm({}));

  // Tippen auf eine Routine startet das Training; Bearbeiten liegt auf dem Stift daneben.
  const todayWeekday = weekdayFromDate(new Date());
  const weekGroup = el('div', { class: 'list' });
  for (let weekday = 1; weekday <= 7; weekday++) {
    const routine = routines.find(r => r.assignedWeekday === weekday);
    const isToday = weekday === todayWeekday;
    const label = el('span', { class: 'weekday-label' }, WEEKDAY_SHORT[weekday - 1]);
    let row;
    if (routine) {
      row = el('div', {
        class: `weekday-row${isToday ? ' today' : ''}`, role: 'button', tabindex: '0',
        'aria-label': `${routine.name} starten`,
        onclick: () => openStrengthSessionForm({ routine }),
      }, [
        label,
        el('div', { class: 'routine-name' }, [
          el('div', { style: 'font-weight:600' }, routine.name),
          el('div', { class: 'text-secondary', style: 'font-size:14px;margin-top:1px' },
            isToday ? 'Heute · tippen zum Starten' : `${routine.exerciseNames.length} Übungen`),
        ]),
        el('button', {
          class: 'icon-btn', style: 'color:var(--text-secondary)', 'aria-label': `${routine.name} bearbeiten`,
          html: icon('pencil', { size: 20 }),
          onclick: (e) => { e.stopPropagation(); openRoutineEditor({ existingRoutine: routine }); },
        }),
        el('span', { class: 'start-icon', html: icon('play', { size: 22 }), 'aria-hidden': 'true' }),
      ]);
    } else {
      row = el('div', {
        class: `weekday-row${isToday ? ' today' : ''}`, role: 'button', tabindex: '0',
        onclick: () => openRoutineEditor({ prefillWeekday: weekday }),
      }, [
        label,
        el('span', { class: 'placeholder' }, 'Routine anlegen'),
        el('span', { class: 'list-row-chevron', html: icon('plus', { size: 20 }) }),
      ]);
    }
    weekGroup.append(row);
  }

  const actionsGroup = el('div', { class: 'list' }, [
    el('div', { class: 'list-row', role: 'button', tabindex: '0', onclick: () => openStrengthMonthOverview() }, [
      el('span', { html: icon('calendar', { size: 22 }), style: 'color:var(--text-secondary);display:flex' }),
      el('span', { class: 'list-row-main list-row-title' }, 'Monatsübersicht'),
      el('span', { class: 'list-row-chevron', html: icon('chevronRight', { size: 20 }) }),
    ]),
  ]);

  container.append(
    el('div', { class: 'content' }, [
      el('section', {}, [el('h2', { class: 'section-title', style: 'margin:0' }, 'Wochenplan'), weekGroup]),
      actionsGroup,
    ]),
  );
}

// ---------- Routinen-Editor ----------

function openRoutineEditor({ existingRoutine, prefillWeekday }) {
  const isEditing = !!existingRoutine;
  let exerciseNames = existingRoutine ? [...existingRoutine.exerciseNames] : [''];
  if (exerciseNames.length === 0) exerciseNames = [''];
  let assignedWeekday = existingRoutine ? existingRoutine.assignedWeekday : (prefillWeekday ?? null);
  let save = null;

  openSheet({
    title: isEditing ? 'Routine bearbeiten' : 'Neue Routine',
    onSave: (close) => save && save(close),
    render(sheet) {
      const nameInput = el('input', { type: 'text', placeholder: 'z. B. Oberkörper A', value: existingRoutine?.name || '' });
      nameInput.classList.add('form-row-left');
      nameInput.style.textAlign = 'left';

      const weekdaySelect = el('select');
      weekdaySelect.append(el('option', { value: '' }, 'Kein fester Tag'));
      WEEKDAY_NAMES.forEach((name, i) => weekdaySelect.append(el('option', { value: String(i + 1) }, name)));
      weekdaySelect.value = assignedWeekday ? String(assignedWeekday) : '';

      const exerciseList = el('div', { class: 'form-group' });
      function renderExercises() {
        exerciseList.innerHTML = '';
        exerciseNames.forEach((name, index) => {
          const input = el('input', { type: 'text', placeholder: 'Übungsname', value: name });
          input.style.textAlign = 'left';
          input.addEventListener('input', () => { exerciseNames[index] = input.value; });
          const row = el('div', { class: 'form-row' }, [input]);
          if (exerciseNames.length > 1) {
            row.append(el('button', {
              class: 'icon-btn', style: 'color:var(--destructive)',
              html: icon('x', { size: 18 }),
              onclick: () => { exerciseNames.splice(index, 1); renderExercises(); },
            }));
          }
          exerciseList.append(row);
        });
      }
      renderExercises();

      sheet.body.append(
        el('div', { class: 'section-title' }, 'Name'),
        el('div', { class: 'form-group' }, [el('div', { class: 'form-row' }, [nameInput])]),

        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Wochentag'),
        el('div', { class: 'form-group' }, [el('div', { class: 'form-row' }, [weekdaySelect])]),

        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Übungen'),
        exerciseList,
        el('button', { class: 'btn btn-secondary btn-block', style: 'margin-top:10px', onclick: () => { exerciseNames.push(''); renderExercises(); } }, [
          el('span', { html: icon('plus', { size: 16 }) }), 'Übung hinzufügen',
        ]),
      );

      if (isEditing) {
        sheet.body.append(
          el('button', {
            class: 'btn btn-destructive btn-block', style: 'margin-top:24px',
            onclick: () => showConfirm({
              actions: [{ label: 'Routine löschen', destructive: true, onClick: async () => {
                await db.delete('routines', existingRoutine.id);
                onDataChanged();
                sheet.close();
              } }],
            }),
          }, 'Routine löschen'),
        );
      }

      sheet.setSaveDisabled(!nameInput.value.trim());
      nameInput.addEventListener('input', () => sheet.setSaveDisabled(!nameInput.value.trim()));

      save = async (close) => {
        if (!nameInput.value.trim()) return;
        const cleaned = exerciseNames.map(n => n.trim()).filter(Boolean);
        const routine = existingRoutine || { id: uuid() };
        routine.name = nameInput.value.trim();
        routine.assignedWeekday = weekdaySelect.value ? parseInt(weekdaySelect.value, 10) : null;
        routine.exerciseNames = cleaned;
        await db.put('routines', routine);
        onDataChanged();
        close();
      };
    },
  });
}

// ---------- Krafttraining-Formular ----------

// ghost = Werte vom letzten Mal (nur als Platzhalter). Eine Ghost-Zeile zählt erst, wenn darin getippt wurde (active);
// dann wird der Ghost-Wert des anderen Feldes übernommen (adopted).
function newSet({ weightKg = null, reps = null, ghost = null } = {}) {
  return { id: uuid(), weightKg, reps, ghost, active: false, adopted: { weight: false, reps: false } };
}

export function openStrengthSessionForm({ existingWorkout, routine, repeatFrom }) {
  const isEditing = !!existingWorkout;
  let sessionName = existingWorkout?.routineName || repeatFrom?.routineName || routine?.name || '';
  // Neue Einheiten starten jetzt; ohne Endzeit gilt beim Sichern die aktuelle Uhrzeit (live im Studio mitloggen).
  let startTime = new Date();
  let endTime = null;
  if (existingWorkout) {
    startTime = new Date(existingWorkout.date);
    endTime = new Date(startTime.getTime() + existingWorkout.durationSeconds * 1000);
  }
  let bodyWeightKg = existingWorkout?.bodyWeightKg ?? null;
  let rpe = existingWorkout?.rpe ?? 5;
  let sessionNotes = existingWorkout?.notes || '';

  let exercises;
  if (existingWorkout) {
    exercises = [...existingWorkout.strengthExercises].sort((a, b) => a.order - b.order).map(ex => ({
      id: uuid(), name: ex.name, notes: ex.notes || '',
      sets: ex.sets.map(s => newSet({ weightKg: s.weightKg ?? null, reps: s.reps ?? null })),
    }));
  } else if (repeatFrom) {
    exercises = [...repeatFrom.strengthExercises].sort((a, b) => a.order - b.order).map(ex => ({
      id: uuid(), name: ex.name, notes: '',
      sets: ex.sets.map(s => newSet({ ghost: { weightKg: s.weightKg ?? null, reps: s.reps ?? null } })),
    }));
  } else if (routine && routine.exerciseNames.length) {
    exercises = routine.exerciseNames.map(name => ({
      id: uuid(), name, notes: '',
      sets: [0, 1, 2].map(() => newSet()),
    }));
  } else {
    exercises = [{ id: uuid(), name: '', notes: '', sets: [0, 1, 2].map(() => newSet()) }];
  }

  const allWorkoutsPromise = db.getAll('workouts');
  let save = null;

  openSheet({
    title: sessionName || (isEditing ? 'Training bearbeiten' : 'Krafttraining'),
    onSave: (close) => save && save(close),
    async render(sheet) {
      const allWorkouts = (await allWorkoutsPromise).filter(w => w.id !== existingWorkout?.id);

      function lastExercise(name) {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const sorted = [...allWorkouts].sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const w of sorted) {
          const match = (w.strengthExercises || []).find(e => e.name.toLowerCase() === trimmed.toLowerCase());
          if (match) return { ...match, date: w.date };
        }
        return null;
      }

      const nameInput = el('input', { type: 'text', placeholder: 'Name (optional), z. B. Oberkörper A', value: sessionName });
      nameInput.style.textAlign = 'left';
      nameInput.addEventListener('input', () => { sessionName = nameInput.value; sheet.setTitle(sessionName || 'Krafttraining'); });

      // Routine gestartet: die Sätze vom letzten Mal stehen als Platzhalter in den Feldern
      if (routine && !existingWorkout && !repeatFrom) {
        for (const ex of exercises) {
          const prev = lastExercise(ex.name);
          if (prev?.sets.length) ex.sets = prev.sets.map(s => newSet({ ghost: { weightKg: s.weightKg ?? null, reps: s.reps ?? null } }));
        }
      }

      const startInput = el('input', { type: 'datetime-local', value: toDateTimeInputValue(startTime) });
      const endInput = el('input', { type: 'datetime-local', value: endTime ? toDateTimeInputValue(endTime) : '' });
      startInput.addEventListener('change', () => {
        const newStart = new Date(startInput.value);
        if (endInput.value && new Date(endInput.value) < newStart) endInput.value = toDateTimeInputValue(newStart);
      });

      const bodyWeightInput = el('input', { type: 'number', step: '0.1', placeholder: 'optional', value: bodyWeightKg ?? '' });

      const exercisesContainer = el('div', { style: 'display:flex;flex-direction:column;gap:14px' });

      function renderExerciseCard(ex, index) {
        const nameField = el('input', { type: 'text', placeholder: 'Übungsname', value: ex.name });
        nameField.addEventListener('input', () => { ex.name = nameField.value; });

        const kebabBtn = el('button', { class: 'icon-btn', style: 'color:var(--text-secondary)', 'aria-label': 'Übung verschieben oder entfernen', html: icon('ellipsis', { size: 22 }) });
        kebabBtn.addEventListener('click', () => {
          const items = [];
          if (index > 0) items.push({ label: 'Nach oben verschieben', icon: 'arrowUp', onClick: () => { [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]]; renderAll(); } });
          if (index < exercises.length - 1) items.push({ label: 'Nach unten verschieben', icon: 'arrowDown', onClick: () => { [exercises[index + 1], exercises[index]] = [exercises[index], exercises[index + 1]]; renderAll(); } });
          items.push({ label: 'Übung entfernen', icon: 'trash', destructive: true, onClick: () => { exercises.splice(index, 1); renderAll(); } });
          showActionMenu(kebabBtn, items);
        });

        const notesField = el('input', { type: 'text', placeholder: 'Notiz zur Übung', value: ex.notes, style: 'font-size:13px;color:var(--text-secondary)' });
        notesField.addEventListener('input', () => { ex.notes = notesField.value; });

        const setsTable = el('div', { class: 'sets-table' });
        function renderSets() {
          setsTable.innerHTML = '';
          setsTable.append(el('div', { class: 'sets-header' }, [
            el('span', { class: 'idx-spacer' }), el('span', {}, 'Gewicht'), el('span', {}, 'Wdh.'), el('span', { class: 'menu-spacer' }),
          ]));
          ex.sets.forEach((set, si) => {
            const ghost = set.ghost;
            const weightInput = el('input', { type: 'number', step: '0.5', placeholder: ghost?.weightKg != null ? String(ghost.weightKg) : 'kg', value: set.weightKg ?? '' });
            const repsInput = el('input', { type: 'number', placeholder: ghost?.reps != null ? String(ghost.reps) : 'Wdh.', value: set.reps ?? '' });
            const onSetInput = (field) => {
              set.adopted[field] = false;
              if (ghost) {
                const typed = (!set.adopted.weight && weightInput.value) || (!set.adopted.reps && repsInput.value);
                if (!typed) {
                  // Eigene Eingaben gelöscht -> Zeile wird wieder zum reinen Vorschlag
                  weightInput.value = '';
                  repsInput.value = '';
                  set.active = false;
                  set.adopted = { weight: false, reps: false };
                } else if (!set.active) {
                  set.active = true;
                  if (field === 'reps' && !weightInput.value && ghost.weightKg != null) { weightInput.value = ghost.weightKg; set.adopted.weight = true; }
                  if (field === 'weight' && !repsInput.value && ghost.reps != null) { repsInput.value = ghost.reps; set.adopted.reps = true; }
                }
              }
              set.weightKg = weightInput.value ? parseFloat(weightInput.value) : null;
              set.reps = repsInput.value ? parseInt(repsInput.value, 10) : null;
            };
            weightInput.addEventListener('input', () => onSetInput('weight'));
            repsInput.addEventListener('input', () => onSetInput('reps'));

            const setMenuBtn = el('button', {
              class: 'icon-btn', style: 'color:var(--text-secondary)', 'aria-label': `Satz ${si + 1} entfernen`,
              html: icon('x', { size: 18 }),
              onclick: () => { ex.sets.splice(si, 1); renderSets(); },
            });

            setsTable.append(el('div', { class: 'set-row' }, [
              el('div', { class: 'set-index' }, String(si + 1)),
              weightInput, repsInput, setMenuBtn,
            ]));
          });
        }
        renderSets();

        const addSetBtn = el('button', { class: 'btn-plain', style: 'display:flex;align-items:center;gap:6px', onclick: () => { ex.sets.push(newSet()); renderSets(); } }, [
          el('span', { html: icon('plus', { size: 18 }), style: 'display:flex' }), 'Satz hinzufügen',
        ]);

        const last = lastExercise(ex.name);

        return el('div', { class: 'exercise-card' }, [
          el('div', { class: 'exercise-card-header' }, [nameField, kebabBtn]),
          last ? el('div', { class: 'last-performance' }, `Zuletzt (${formatDateShort(last.date)}): ${exerciseSummary(last)}`) : null,
          setsTable,
          addSetBtn,
          notesField,
        ]);
      }

      function renderAll() {
        exercisesContainer.innerHTML = '';
        exercises.forEach((ex, i) => exercisesContainer.append(renderExerciseCard(ex, i)));
      }
      renderAll();

      const addExerciseBtn = el('button', { class: 'btn btn-secondary btn-block', onclick: () => {
        exercises.push({ id: uuid(), name: '', notes: '', sets: [0, 1, 2].map(() => newSet()) });
        renderAll();
      } }, [el('span', { html: icon('plus', { size: 16 }) }), 'Übung hinzufügen']);

      const rpeLabel = el('span', {}, rpeText(rpe));
      const rpeInput = el('input', { type: 'range', min: 1, max: 10, step: 1, value: rpe });
      rpeInput.addEventListener('input', () => { rpe = Number(rpeInput.value); rpeLabel.textContent = rpeText(rpe); });

      const notesInput = el('textarea', { placeholder: 'Wie ist es gelaufen?' }, sessionNotes);

      sheet.body.append(
        el('div', { class: 'form-group' }, [
          el('div', { class: 'form-row' }, [nameInput]),
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Startzeit'), startInput]),
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Endzeit'), endInput]),
          endTime ? null : el('div', { class: 'form-row text-secondary', style: 'font-size:14px;min-height:0' }, 'Ohne Endzeit zählt die Uhrzeit beim Sichern. Sofort gesichert: 45 min bis jetzt.'),
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Körpergewicht'), bodyWeightInput, el('span', { class: 'unit-suffix' }, 'kg')]),
        ]),
        el('div', { style: 'margin-top:16px' }, exercisesContainer),
        el('div', { style: 'margin-top:10px' }, addExerciseBtn),
        el('div', { class: 'section-title', style: 'margin-top:20px' }, rpeLabel),
        el('div', { class: 'form-group' }, [el('div', { class: 'form-row' }, rpeInput)]),
        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Notizen zum Training'),
        el('div', { class: 'form-group' }, [el('div', { class: 'form-row' }, notesInput)]),
      );

      save = async (close) => {
        let start = new Date(startInput.value);
        const end = endInput.value ? new Date(endInput.value) : new Date();
        // Ohne Endzeit direkt nach dem Öffnen gesichert = nachgetragen: dann 45 min bis jetzt statt 0 min
        if (!endInput.value && end - start < 5 * 60 * 1000) start = new Date(end.getTime() - 45 * 60 * 1000);
        const durationSeconds = Math.max(0, Math.round((end - start) / 1000));

        const workout = existingWorkout || { id: uuid() };
        workout.sportType = 'strength';
        workout.date = start.toISOString();
        workout.durationSeconds = durationSeconds;
        workout.bodyWeightKg = bodyWeightInput.value ? parseFloat(bodyWeightInput.value) : null;
        workout.rpe = rpe;
        workout.notes = notesInput.value.trim() || null;
        workout.routineName = sessionName.trim() || null;
        workout.distanceKm = null;
        workout.avgHeartRate = null;
        workout.maxHeartRate = null;
        workout.strengthExercises = exercises
          .map(ex => ({
            ex,
            // Unberührte Vorschläge und komplett leere Sätze werden nicht gespeichert
            sets: ex.sets
              .filter(s => (!s.ghost || s.active) && (s.weightKg != null || s.reps != null))
              .map(s => ({ weightKg: s.weightKg, reps: s.reps })),
          }))
          .filter(({ ex, sets }) => ex.name.trim() && sets.length)
          .map(({ ex, sets }, index) => ({
            id: ex.id, name: ex.name.trim(), notes: ex.notes.trim() || null, order: index, sets,
          }));

        await db.put('workouts', workout);
        onDataChanged();
        close();
      };
    },
  });
}

// ---------- Monatsübersicht ----------

function openStrengthMonthOverview() {
  let monthOffset = 0;

  openSheet({
    title: 'Monatsübersicht',
    leftLabel: 'Fertig',
    noRightButton: true,
    render(sheet) {
      sheet.body.innerHTML = '';
      const nav = el('div', { class: 'month-nav', style: 'justify-content:center;margin-bottom:16px' }, [
        el('button', { 'aria-label': 'Vorheriger Monat', html: icon('chevronLeft', { size: 22 }), onclick: () => { monthOffset -= 1; draw(); } }),
        el('div', { id: 'month-label', class: 'figure', style: 'font-size:22px;font-weight:700;text-transform:uppercase;min-width:180px;text-align:center' }),
        el('button', { 'aria-label': 'Nächster Monat', html: icon('chevronRight', { size: 22 }), onclick: () => { monthOffset += 1; draw(); } }),
      ]);
      const listWrap = el('div');
      sheet.body.append(nav, listWrap);

      async function draw() {
        const displayedMonth = new Date();
        displayedMonth.setMonth(displayedMonth.getMonth() + monthOffset);
        nav.querySelector('#month-label').textContent = formatMonthYear(displayedMonth);
        nav.querySelectorAll('button')[1].disabled = monthOffset >= 0;

        const start = startOfMonth(displayedMonth);
        const end = endOfMonth(displayedMonth);
        const workouts = (await db.getAll('workouts'))
          .filter(w => w.sportType === 'strength' && new Date(w.date) >= start && new Date(w.date) < end)
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        listWrap.innerHTML = '';
        if (workouts.length === 0) {
          listWrap.append(el('p', { class: 'text-secondary', style: 'text-align:center;padding:24px' }, 'Keine Krafttrainings in diesem Monat.'));
          return;
        }
        const list = el('div', { class: 'list' });
        listWrap.append(el('p', { class: 'text-secondary', style: 'margin:0 4px 10px' }, `${workouts.length} ${workouts.length === 1 ? 'Krafttraining' : 'Krafttrainings'}`));
        for (const w of workouts) {
          const exerciseNames = (w.strengthExercises || []).map(e => e.name).join(', ');
          list.append(el('div', {
            class: 'list-row',
            onclick: async () => { sheet.close(); const { openWorkoutDetail } = await import('./log.js'); openWorkoutDetail(w); },
          }, [
            el('div', { class: 'list-row-main' }, [
              el('div', { class: 'list-row-title' }, w.routineName || 'Krafttraining'),
              el('div', { class: 'list-row-subtitle' }, `${formatDateAbbrev(w.date)} · ${exerciseNames}`),
            ]),
          ]));
        }
        listWrap.append(list);
      }
      draw();
    },
  });
}
