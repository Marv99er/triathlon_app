import { el } from './utils.js';
import { icon } from './icons.js';
import { openSheet, showToast, showConfirm } from './ui.js';
import { db } from './db.js';

const MODES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Hell' },
  { id: 'dark', label: 'Dunkel' },
];

export function applyStoredTheme() {
  const mode = localStorage.getItem('appearanceMode') || 'system';
  if (mode === 'light' || mode === 'dark') {
    document.documentElement.setAttribute('data-theme', mode);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function openSettingsSheet() {
  openSheet({
    title: 'Einstellungen',
    saveLabel: 'Fertig',
    onSave: (close) => close(),
    render(sheet) {
      const currentMode = localStorage.getItem('appearanceMode') || 'system';

      const radioList = el('div', { class: 'radio-list' });
      for (const mode of MODES) {
        const row = el('div', {
          class: `radio-row${mode.id === currentMode ? ' selected' : ''}`,
          onclick: () => {
            localStorage.setItem('appearanceMode', mode.id);
            applyStoredTheme();
            radioList.querySelectorAll('.radio-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
          },
        }, [
          el('span', {}, mode.label),
          el('span', { class: 'radio-check', html: icon('check', { size: 18 }) }),
        ]);
        radioList.append(row);
      }

      const exportBtn = el('button', { class: 'btn btn-secondary btn-block', onclick: exportData }, [
        el('span', { html: icon('download', { size: 18 }) }), 'Daten exportieren (Backup)',
      ]);
      const importInput = el('input', { type: 'file', accept: 'application/json', style: 'display:none' });
      importInput.addEventListener('change', () => importData(importInput.files[0]));
      const importBtn = el('button', { class: 'btn btn-secondary btn-block', onclick: () => importInput.click() }, [
        el('span', { html: icon('upload', { size: 18 }) }), 'Daten importieren',
      ]);

      sheet.body.append(
        el('div', { class: 'section-title' }, 'Erscheinungsbild'),
        el('div', { class: 'form-group' }, radioList),
        el('div', { class: 'section-title', style: 'margin-top:24px' }, 'Daten'),
        el('div', { class: 'card', style: 'display:flex;flex-direction:column;gap:10px' }, [
          el('p', { class: 'text-secondary', style: 'margin:0;font-size:13px' },
            'Deine Trainingsdaten liegen nur lokal auf diesem Gerät im Browser-Speicher (kein Cloud-Sync). Erstelle ab und zu ein Backup als Sicherung.'),
          exportBtn, importBtn, importInput,
        ])
      );
    },
  });
}

async function exportData() {
  const data = await db.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: `trilog-backup-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Backup wird heruntergeladen');
}

async function importData(file) {
  if (!file) return;
  showConfirm({
    title: 'Bestehende Daten werden durch das Backup ersetzt.',
    actions: [{
      label: 'Importieren',
      destructive: true,
      onClick: async () => {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          await db.importAll(data);
          showToast('Import erfolgreich – bitte App neu laden');
        } catch (e) {
          showToast('Import fehlgeschlagen: Datei ungültig');
        }
      },
    }],
  });
}
