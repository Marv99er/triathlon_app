import { el, SPORT_TYPES, formatDateAbbrev, formatDateShort, formatClock, formatDistance, daysUntil, toDateInputValue } from './utils.js';
import { icon } from './icons.js';
import { openSheet, showConfirm, fab } from './ui.js';
import { db, uuid } from './db.js';
import { emptyState } from './log.js';

let onDataChanged = () => {};
export function setOnDataChanged(fn) { onDataChanged = fn; }

function timeFields(prefix, seconds) {
  const total = seconds || 0;
  return {
    h: el('input', { type: 'number', inputmode: 'numeric', 'aria-label': 'Stunden', value: total ? Math.floor(total / 3600) : '', placeholder: 'h' }),
    m: el('input', { type: 'number', inputmode: 'numeric', 'aria-label': 'Minuten', value: total ? String(Math.floor((total % 3600) / 60)).padStart(2, '0') : '', placeholder: 'mm' }),
    s: el('input', { type: 'number', inputmode: 'numeric', 'aria-label': 'Sekunden', value: total ? String(total % 60).padStart(2, '0') : '', placeholder: 'ss' }),
  };
}

function readTimeFields(fields) {
  const h = Math.max(0, parseInt(fields.h.value, 10) || 0);
  const m = Math.max(0, parseInt(fields.m.value, 10) || 0);
  const s = Math.max(0, parseInt(fields.s.value, 10) || 0);
  return h * 3600 + m * 60 + s;
}

function durationFieldRow(label, fields) {
  return el('div', { class: 'form-row' }, [
    el('label', { class: 'form-label' }, label),
    el('div', { class: 'duration-field' }, [fields.h, el('span', {}, ':'), fields.m, el('span', {}, ':'), fields.s]),
  ]);
}

// Ältere Einträge haben noch keinen Haken gespeichert, bei ihnen entscheidet das Datum
const isPlanned = (c) => c.isPlanned ?? daysUntil(c.date) >= 0;
const isUpcoming = (c) => isPlanned(c) && daysUntil(c.date) >= 0;
// Bei geplanten Rennen ist die gespeicherte Zeit das Ziel, also kein Ergebnis
const resultSeconds = (c) => isPlanned(c) ? 0 : c.totalDurationSeconds;
const totalClock = (c) => resultSeconds(c) ? formatClock(resultSeconds(c)) : '–';

export function nextRace(competitions) {
  return competitions.filter(isUpcoming).sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
}

function raceKind(c) {
  if (c.isTriathlon) return 'Triathlon';
  const sport = c.sportType ? SPORT_TYPES[c.sportType].displayName : 'Wettkampf';
  return c.distanceKm ? `${sport} · ${formatDistance(c.sportType, c.distanceKm)}` : sport;
}

// Startnummer: das nächste Rennen mit Countdown in Tagen, die eingetragene Zeit gilt als Ziel
export function raceBib(race, { interactive = true } = {}) {
  if (!race) {
    return el('div', { class: 'bib empty' }, [
      el('div', { class: 'bib-head' }, [el('span', {}, 'Kein Rennen geplant')]),
      el('p', {}, 'Trag dein nächstes Rennen ein, dann zählt TriLog die Tage bis zum Start.'),
      el('button', { class: 'btn btn-primary', onclick: () => openCompetitionForm({ planned: true }) }, 'Rennen eintragen'),
    ]);
  }
  const days = daysUntil(race.date);
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  const span = days === 0 ? 'Heute ist Renntag' : weeks > 0 ? `${weeks} Wo${rest ? ` ${rest} T` : ''}` : `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
  return el('div', {
    class: `bib${interactive ? '' : ' static'}`, role: interactive ? 'button' : null, tabindex: interactive ? '0' : null,
    'aria-label': `Nächstes Rennen: ${race.name}, in ${days} Tagen`,
    onclick: interactive ? () => openCompetitionDetail(race) : null,
  }, [
    el('div', { class: 'bib-head' }, [el('span', {}, race.name), el('span', {}, formatDateShort(race.date))]),
    el('div', { class: 'bib-number' }, [
      el('span', { class: 'n' }, String(days)),
      el('span', { class: 'u' }, days === 1 ? 'Tag' : 'Tage'),
    ]),
    el('div', { class: 'bib-band' }, [
      el('span', {}, race.totalDurationSeconds ? `Ziel ${formatClock(race.totalDurationSeconds)}` : raceKind(race)),
      el('span', {}, span),
    ]),
  ]);
}

export async function renderCompetitionsPage(container) {
  const competitions = (await db.getAll('competitions')).sort((a, b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = '';

  const addBtn = fab('Rennen eintragen', () => openCompetitionForm({}));
  container.append(
    el('div', { class: 'navbar' }, [
      el('div', { class: 'navbar-row' }, [el('h1', { class: 'navbar-title', style: 'margin:0' }, 'Rennen')]),
    ]),
  );

  if (competitions.length === 0) {
    container.append(emptyState('Noch kein Rennen', 'Trag dein nächstes Rennen oder ein vergangenes Ergebnis ein.', addBtn, 'flagCheckered', 'Rennen eintragen'));
    return;
  }

  const upcoming = competitions.filter(isUpcoming).reverse();
  const results = competitions.filter(c => !isUpcoming(c));
  const content = el('div', { class: 'content' });

  content.append(
    el('section', {}, [
      el('h2', { class: 'section-title', style: 'margin:0' }, 'Nächstes Rennen'),
      raceBib(upcoming[0] || null),
    ]),
  );

  if (upcoming.length > 1) {
    content.append(
      el('section', {}, [
        el('h2', { class: 'section-title', style: 'margin:0' }, 'Danach'),
        el('div', { class: 'list' }, upcoming.slice(1).map(c => competitionRow(c, `in ${daysUntil(c.date)} Tagen`))),
      ]),
    );
  }

  if (results.length) {
    const [latest, ...older] = results;
    content.append(
      el('section', {}, [
        el('h2', { class: 'section-title', style: 'margin:0' }, 'Ergebnisse'),
        resultCard(latest),
        older.length ? el('div', { class: 'list', style: 'margin-top:12px' }, older.map(c => competitionRow(c, totalClock(c)))) : null,
      ]),
    );
  }

  container.append(content);
}

function resultCard(c, { interactive = true } = {}) {
  const card = el('div', { class: `result${interactive ? '' : ' static'}`, role: interactive ? 'button' : null, tabindex: interactive ? '0' : null, onclick: interactive ? () => openCompetitionDetail(c) : null }, [
    el('div', { class: 'result-head' }, [
      el('span', { class: 'result-name' }, c.name),
      el('span', { class: 'result-date' }, formatDateAbbrev(c.date)),
    ]),
    el('div', { class: `result-time${resultSeconds(c) ? '' : ' missing'}` }, totalClock(c)),
    el('div', { class: 'result-meta' }, [raceKind(c), c.placement ? `Platz ${c.placement}` : null, resultSeconds(c) ? null : 'Ergebnis offen'].filter(Boolean).join(' · ')),
  ]);

  // Feste Abfolge Swim · T1 · Bike · T2 · Run: fehlende Splits bleiben als Lücke sichtbar
  if (c.isTriathlon) {
    const legs = [
      ['Swim', c.swimDurationSeconds], ['T1', c.t1DurationSeconds], ['Bike', c.bikeDurationSeconds],
      ['T2', c.t2DurationSeconds], ['Run', c.runDurationSeconds],
    ];
    card.append(el('div', { class: 'splits' }, legs.map(([label, sec]) =>
      el('div', { class: 'split' }, [
        el('div', { class: 'k' }, label),
        el('div', { class: `t${sec ? '' : ' missing'}` }, sec ? formatClock(sec) : '–'),
      ])
    )));
  }
  return card;
}

function competitionRow(c, trailing) {
  return el('div', { class: 'list-row', role: 'button', tabindex: '0', onclick: () => openCompetitionDetail(c) }, [
    el('div', { class: 'list-row-main' }, [
      el('div', { class: 'list-row-title' }, c.name),
      el('div', { class: 'list-row-subtitle' }, `${formatDateAbbrev(c.date)} · ${raceKind(c)}`),
    ]),
    el('div', { class: 'list-row-trailing figure', style: 'font-size:20px;font-weight:700;color:var(--text)' }, trailing),
  ]);
}

// Tippen zeigt erst das Rennen; Bearbeiten liegt oben rechts (gleiche Regel wie bei Trainings)
function openCompetitionDetail(c) {
  openSheet({
    title: c.name,
    leftLabel: 'Fertig',
    saveLabel: 'Bearbeiten',
    onSave: (close) => { close(); openCompetitionForm({ existingCompetition: c }); },
    render(sheet) {
      sheet.body.append(isUpcoming(c) ? raceBib(c, { interactive: false }) : resultCard(c, { interactive: false }));
      if (c.notes) {
        sheet.body.append(
          el('div', { class: 'section-title', style: 'margin-top:24px' }, 'Notizen'),
          el('div', { class: 'card' }, c.notes),
        );
      }
    },
  });
}

export function openCompetitionForm({ existingCompetition, planned: plannedDefault = false }) {
  const isEditing = !!existingCompetition;
  // Ein geplantes Rennen, dessen Datum vorbei ist, öffnet direkt zum Eintragen des Ergebnisses
  let planned = isEditing ? isUpcoming(existingCompetition) : plannedDefault;
  let isTriathlon = existingCompetition?.isTriathlon || false;
  let sportType = existingCompetition?.sportType || 'run';
  let save = null;

  openSheet({
    title: isEditing ? 'Wettkampf bearbeiten' : 'Wettkampf eintragen',
    onSave: (close) => save && save(close),
    render(sheet) {
      const nameInput = el('input', { type: 'text', placeholder: 'z. B. Stadttriathlon Musterhausen', value: existingCompetition?.name || '' });
      nameInput.style.textAlign = 'left';
      const dateInput = el('input', { type: 'date', value: toDateInputValue(existingCompetition?.date || new Date()) });
      const plannedCheck = el('input', { type: 'checkbox', class: 'check' });
      plannedCheck.checked = planned;
      const dateHint = el('p', { class: 'form-hint' });
      const triToggle = el('input', { type: 'checkbox', class: 'toggle' });
      triToggle.checked = isTriathlon;
      const triLabel = el('label', { class: 'form-label' });

      const disciplineSection = el('div');
      const sportSelect = el('select');
      Object.entries(SPORT_TYPES).forEach(([key, sport]) => sportSelect.append(el('option', { value: key }, sport.displayName)));
      sportSelect.value = sportType;
      const distanceInput = el('input', { type: 'number', step: '0.01', placeholder: 'z. B. 10.5', value: existingCompetition?.distanceKm ?? '' });
      const distanceRow = el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Distanz'), distanceInput, el('span', { class: 'unit-suffix' }, 'km')]);

      function renderDiscipline() {
        disciplineSection.innerHTML = '';
        if (isTriathlon) return;
        disciplineSection.append(
          el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Disziplin'),
          el('div', { class: 'form-group' }, [
            el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Sportart'), sportSelect]),
            SPORT_TYPES[sportType].tracksDistance ? distanceRow : null,
          ]),
        );
      }

      // Zielzeit und Ergebnis sind getrennte Felder, damit ein Ziel nie versehentlich zum Ergebnis wird
      const wasPlanned = isEditing && isPlanned(existingCompetition);
      const goalFields = timeFields('goal', wasPlanned ? existingCompetition.totalDurationSeconds : 0);
      const totalFields = timeFields('total', wasPlanned ? 0 : existingCompetition?.totalDurationSeconds);
      const swimFields = timeFields('swim', existingCompetition?.swimDurationSeconds);
      const t1Fields = timeFields('t1', existingCompetition?.t1DurationSeconds);
      const bikeFields = timeFields('bike', existingCompetition?.bikeDurationSeconds);
      const t2Fields = timeFields('t2', existingCompetition?.t2DurationSeconds);
      const runFields = timeFields('run', existingCompetition?.runDurationSeconds);

      const splitSection = el('div');
      function renderSplits() {
        splitSection.innerHTML = '';
        if (!isTriathlon || planned) return;
        splitSection.append(
          el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Einzelzeiten (optional)'),
          el('div', { class: 'form-group' }, [
            durationFieldRow('Schwimmen', swimFields),
            durationFieldRow('Wechsel 1', t1Fields),
            durationFieldRow('Radfahren', bikeFields),
            durationFieldRow('Wechsel 2', t2Fields),
            durationFieldRow('Laufen', runFields),
          ]),
        );
      }

      sportSelect.addEventListener('change', () => { sportType = sportSelect.value; renderDiscipline(); });
      triToggle.addEventListener('change', () => { isTriathlon = triToggle.checked; renderDiscipline(); renderSplits(); });

      const timeTitle = el('div', { class: 'section-title', style: 'margin-top:24px' });
      const timeGroup = el('div', { class: 'form-group' });
      const timeHint = el('p', { class: 'form-hint' });
      const placementInput = el('input', { type: 'number', placeholder: 'optional', value: existingCompetition?.placement ?? '' });
      const placementRow = el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Platzierung'), placementInput]);
      const notesInput = el('textarea', { placeholder: 'Notizen' }, existingCompetition?.notes || '');
      const notesRow = el('div', { class: 'form-row' }, [notesInput]);
      const otherGroup = el('div', { class: 'form-group' });

      // Der Haken entscheidet: geplant = Zielzeit, sonst Ergebnis mit Zeit, Einzelzeiten und Platzierung
      function renderMode() {
        triLabel.textContent = planned ? 'Triathlon' : 'Triathlon mit Einzelzeiten';
        timeTitle.textContent = planned ? 'Zielzeit (optional)' : 'Gesamtzeit';
        timeGroup.innerHTML = '';
        timeGroup.append(durationFieldRow(planned ? 'Ziel' : 'Zeit', planned ? goalFields : totalFields));
        otherGroup.innerHTML = '';
        if (!planned) otherGroup.append(placementRow);
        otherGroup.append(notesRow);
        renderSplits();
      }

      sheet.body.append(
        el('div', { class: 'section-title' }, 'Wettkampf'),
        el('div', { class: 'form-group' }, [
          el('div', { class: 'form-row' }, [nameInput]),
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Datum'), dateInput]),
          el('label', { class: 'form-row check-row' }, [el('span', { class: 'form-label' }, 'Geplantes Rennen'), plannedCheck]),
          el('div', { class: 'form-row' }, [triLabel, triToggle]),
        ]),
        dateHint,
        disciplineSection,
        timeTitle,
        timeGroup,
        timeHint,
        splitSection,
        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Sonstiges'),
        otherGroup,
      );
      renderDiscipline();
      renderMode();

      if (isEditing) {
        sheet.body.append(
          el('button', {
            class: 'btn btn-destructive btn-block', style: 'margin-top:24px',
            onclick: () => showConfirm({
              actions: [{ label: 'Wettkampf löschen', destructive: true, onClick: async () => {
                await db.delete('competitions', existingCompetition.id);
                onDataChanged();
                sheet.close();
              } }],
            }),
          }, 'Wettkampf löschen'),
        );
      }

      function dateConflict() {
        if (!dateInput.value) return '';
        const days = daysUntil(dateInput.value + 'T12:00:00');
        if (planned && days < 0) return 'Dieses Datum liegt in der Vergangenheit. Nimm den Haken raus, um das Ergebnis einzutragen, oder wähle ein Datum ab heute.';
        if (!planned && days > 0) return 'Dieses Datum liegt in der Zukunft. Setz den Haken bei „Geplantes Rennen“, wenn das Rennen noch kommt.';
        return '';
      }
      const needsResultTime = () => !planned && readTimeFields(totalFields) === 0;
      const canSave = () => !!nameInput.value.trim() && !!dateInput.value && !dateConflict() && !needsResultTime();
      // Ist Sichern gesperrt, sagt der Hinweis warum
      function updateSaveDisabled() {
        sheet.setSaveDisabled(!canSave());
        dateHint.textContent = dateConflict();
        dateHint.hidden = !dateHint.textContent;
        timeHint.textContent = nameInput.value.trim() && needsResultTime() ? 'Trag die Gesamtzeit ein, um das Ergebnis zu sichern.' : '';
        timeHint.hidden = !timeHint.textContent;
      }
      plannedCheck.addEventListener('change', () => { planned = plannedCheck.checked; renderMode(); updateSaveDisabled(); });
      nameInput.addEventListener('input', updateSaveDisabled);
      dateInput.addEventListener('input', updateSaveDisabled);
      dateInput.addEventListener('change', updateSaveDisabled);
      Object.values(totalFields).forEach(f => f.addEventListener('input', updateSaveDisabled));
      updateSaveDisabled();

      save = async (close) => {
        if (!canSave()) return;
        const competition = existingCompetition || { id: uuid() };
        competition.name = nameInput.value.trim();
        competition.date = new Date(dateInput.value + 'T12:00:00').toISOString();
        competition.isTriathlon = isTriathlon;
        competition.sportType = isTriathlon ? null : sportType;
        competition.distanceKm = (!isTriathlon && SPORT_TYPES[sportType].tracksDistance && distanceInput.value) ? parseFloat(distanceInput.value) : null;
        competition.isPlanned = planned;
        competition.totalDurationSeconds = readTimeFields(planned ? goalFields : totalFields);
        competition.swimDurationSeconds = (isTriathlon && readTimeFields(swimFields) > 0) ? readTimeFields(swimFields) : null;
        competition.t1DurationSeconds = (isTriathlon && readTimeFields(t1Fields) > 0) ? readTimeFields(t1Fields) : null;
        competition.bikeDurationSeconds = (isTriathlon && readTimeFields(bikeFields) > 0) ? readTimeFields(bikeFields) : null;
        competition.t2DurationSeconds = (isTriathlon && readTimeFields(t2Fields) > 0) ? readTimeFields(t2Fields) : null;
        competition.runDurationSeconds = (isTriathlon && readTimeFields(runFields) > 0) ? readTimeFields(runFields) : null;
        competition.placement = placementInput.value ? parseInt(placementInput.value, 10) : null;
        competition.notes = notesInput.value.trim() || null;

        await db.put('competitions', competition);
        onDataChanged();
        close();
      };
    },
  });
}
