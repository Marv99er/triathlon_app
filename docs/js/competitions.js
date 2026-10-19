import { el, SPORT_TYPES, formatDateAbbrev, formatClock, toDateInputValue } from './utils.js';
import { icon } from './icons.js';
import { openSheet, showConfirm } from './ui.js';
import { db, uuid } from './db.js';
import { emptyState } from './log.js';

let onDataChanged = () => {};
export function setOnDataChanged(fn) { onDataChanged = fn; }

function timeFields(prefix, seconds) {
  const total = seconds || 0;
  return {
    h: el('input', { type: 'number', value: Math.floor(total / 3600), placeholder: 'hh' }),
    m: el('input', { type: 'number', value: Math.floor((total % 3600) / 60), placeholder: 'mm' }),
    s: el('input', { type: 'number', value: total % 60, placeholder: 'ss' }),
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

export async function renderCompetitionsPage(container) {
  const competitions = (await db.getAll('competitions')).sort((a, b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = '';

  const addBtn = el('button', { class: 'navbar-btn', html: icon('plus', { size: 22 }), onclick: () => openCompetitionForm({}) });
  container.append(
    el('div', { class: 'navbar' }, [
      el('div', { class: 'navbar-row' }, [el('div', { class: 'navbar-spacer' }), el('div', { class: 'navbar-title' }, 'Wettkämpfe'), addBtn]),
    ]),
  );

  if (competitions.length === 0) {
    container.append(emptyState('Noch kein Wettkampf', 'Trage deinen letzten Wettkampf ein, um deine Zeiten im Blick zu behalten.', addBtn, 'flagCheckered', 'Wettkampf hinzufügen'));
    return;
  }

  const [latest, ...history] = competitions;
  const content = el('div', { class: 'content' });

  content.append(
    el('div', {}, [
      el('div', { class: 'section-title' }, 'Letzter Wettkampf'),
      heroCard(latest),
    ]),
  );

  if (history.length) {
    content.append(
      el('div', {}, [
        el('div', { class: 'section-title' }, 'Verlauf'),
        el('div', { class: 'list' }, history.map(c => competitionRow(c))),
      ]),
    );
  }

  container.append(content);
}

function heroCard(c) {
  const icn = c.isTriathlon ? 'trophy' : (c.sportType ? SPORT_TYPES[c.sportType].icon : 'flagCheckered');
  const card = el('div', {
    class: 'hero-card', style: 'display:flex;flex-direction:column;gap:12px;cursor:pointer',
    onclick: () => openCompetitionForm({ existingCompetition: c }),
  });
  card.append(
    el('div', { style: 'display:flex;align-items:center;gap:8px' }, [
      el('span', { html: icon(icn, { size: 18 }), style: 'color:#FF9F0A' }),
      el('span', { style: 'font-weight:600;flex:1' }, c.name),
      el('span', { class: 'text-secondary', style: 'font-size:13px' }, formatDateAbbrev(c.date)),
    ]),
    el('div', { style: 'font-size:40px;font-weight:700' }, formatClock(c.totalDurationSeconds)),
  );

  if (c.isTriathlon) {
    const splits = [];
    if (c.swimDurationSeconds) splits.push(['Schwimmen', c.swimDurationSeconds]);
    if (c.bikeDurationSeconds) splits.push(['Rad', c.bikeDurationSeconds]);
    if (c.runDurationSeconds) splits.push(['Lauf', c.runDurationSeconds]);
    if (splits.length) {
      card.append(el('div', { style: 'display:flex;gap:20px' }, splits.map(([label, sec]) =>
        el('div', {}, [
          el('div', { style: 'font-size:11px;color:var(--text-secondary)' }, label),
          el('div', { style: 'font-size:13px;font-weight:600' }, formatClock(sec)),
        ])
      )));
    }
  } else if (c.distanceKm) {
    card.append(el('div', { class: 'text-secondary', style: 'font-size:14px' }, `${c.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 2 })} km`));
  }

  if (c.placement) {
    card.append(el('div', { class: 'text-secondary', style: 'font-size:12px' }, `Platzierung: ${c.placement}`));
  }

  return card;
}

function competitionRow(c) {
  const icn = c.isTriathlon ? 'trophy' : (c.sportType ? SPORT_TYPES[c.sportType].icon : 'flagCheckered');
  return el('div', { class: 'list-row', onclick: () => openCompetitionForm({ existingCompetition: c }) }, [
    el('div', { style: 'width:36px;height:36px;border-radius:999px;background:#FF9F0A26;color:#FF9F0A;display:flex;align-items:center;justify-content:center;flex-shrink:0', html: icon(icn, { size: 16 }) }),
    el('div', { class: 'list-row-main' }, [
      el('div', { class: 'list-row-title' }, c.name),
      el('div', { class: 'list-row-subtitle' }, formatDateAbbrev(c.date)),
    ]),
    el('div', { class: 'list-row-trailing', style: 'font-weight:600;color:var(--text)' }, formatClock(c.totalDurationSeconds)),
  ]);
}

function openCompetitionForm({ existingCompetition }) {
  const isEditing = !!existingCompetition;
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
      const triToggle = el('input', { type: 'checkbox', class: 'toggle' });
      triToggle.checked = isTriathlon;

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

      const totalFields = timeFields('total', existingCompetition?.totalDurationSeconds);
      const swimFields = timeFields('swim', existingCompetition?.swimDurationSeconds);
      const t1Fields = timeFields('t1', existingCompetition?.t1DurationSeconds);
      const bikeFields = timeFields('bike', existingCompetition?.bikeDurationSeconds);
      const t2Fields = timeFields('t2', existingCompetition?.t2DurationSeconds);
      const runFields = timeFields('run', existingCompetition?.runDurationSeconds);

      const splitSection = el('div');
      function renderSplits() {
        splitSection.innerHTML = '';
        if (!isTriathlon) return;
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

      const placementInput = el('input', { type: 'number', placeholder: 'optional', value: existingCompetition?.placement ?? '' });
      const notesInput = el('textarea', { placeholder: 'Notizen' }, existingCompetition?.notes || '');

      sheet.body.append(
        el('div', { class: 'section-title' }, 'Wettkampf'),
        el('div', { class: 'form-group' }, [
          el('div', { class: 'form-row' }, [nameInput]),
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Datum'), dateInput]),
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Triathlon mit Einzelzeiten'), triToggle]),
        ]),
        disciplineSection,
        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Gesamtzeit (hh:mm:ss)'),
        el('div', { class: 'form-group' }, [durationFieldRow('Zeit', totalFields)]),
        splitSection,
        el('div', { class: 'section-title', style: 'margin-top:20px' }, 'Sonstiges'),
        el('div', { class: 'form-group' }, [
          el('div', { class: 'form-row' }, [el('label', { class: 'form-label' }, 'Platzierung'), placementInput]),
          el('div', { class: 'form-row' }, [notesInput]),
        ]),
      );
      renderDiscipline();
      renderSplits();

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

      function updateSaveDisabled() {
        sheet.setSaveDisabled(!nameInput.value.trim() || readTimeFields(totalFields) === 0);
      }
      nameInput.addEventListener('input', updateSaveDisabled);
      [...Object.values(totalFields)].forEach(f => f.addEventListener('input', updateSaveDisabled));
      updateSaveDisabled();

      save = async (close) => {
        if (!nameInput.value.trim() || readTimeFields(totalFields) === 0) return;
        const competition = existingCompetition || { id: uuid() };
        competition.name = nameInput.value.trim();
        competition.date = new Date(dateInput.value + 'T12:00:00').toISOString();
        competition.isTriathlon = isTriathlon;
        competition.sportType = isTriathlon ? null : sportType;
        competition.distanceKm = (!isTriathlon && SPORT_TYPES[sportType].tracksDistance && distanceInput.value) ? parseFloat(distanceInput.value) : null;
        competition.totalDurationSeconds = readTimeFields(totalFields);
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
