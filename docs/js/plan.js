import { el } from './utils.js';
import { icon } from './icons.js';
import { showActionMenu, showConfirm, showToast, fab } from './ui.js';
import { db, uuid } from './db.js';

let currentObjectUrl = null;

export async function renderPlanPage(container) {
  const docs = await db.getAll('planDocument');
  const document_ = docs[0] || null;
  container.innerHTML = '';

  const photoInput = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
  const pdfInput = el('input', { type: 'file', accept: 'application/pdf', style: 'display:none' });
  photoInput.addEventListener('change', () => handleFile(photoInput.files[0]));
  pdfInput.addEventListener('change', () => handleFile(pdfInput.files[0]));

  async function handleFile(file) {
    if (!file) return;
    await db.clear('planDocument');
    await db.put('planDocument', { id: uuid(), fileName: file.name, uploadedDate: new Date().toISOString(), blob: file });
    showToast('Trainingsplan gespeichert');
    renderPlanPage(container);
  }

  const menuBtn = el('button', { class: 'navbar-btn', 'aria-label': document_ ? 'Plan ersetzen oder löschen' : 'Plan hochladen', html: icon(document_ ? 'ellipsis' : 'plus', { size: 24 }) });
  const backBtn = el('button', {
    class: 'navbar-btn', style: 'padding-left:0', 'aria-label': 'Zurück zur Woche',
    html: icon('chevronLeft', { size: 26 }),
    onclick: () => window.dispatchEvent(new CustomEvent('trilog-show-page', { detail: 'dashboard' })),
  });
  fab(document_ ? 'Plan ersetzen' : 'Plan hochladen', () => menuBtn.click());
  menuBtn.addEventListener('click', () => {
    const items = [
      { label: 'Foto auswählen', icon: 'photo', onClick: () => photoInput.click() },
      { label: 'PDF auswählen', icon: 'arrowDownDoc', onClick: () => pdfInput.click() },
    ];
    if (document_) {
      items.push({ label: 'Löschen', icon: 'trash', destructive: true, onClick: () => {
        showConfirm({
          title: 'Trainingsplan wirklich löschen?',
          actions: [{ label: 'Löschen', destructive: true, onClick: async () => {
            await db.clear('planDocument');
            renderPlanPage(container);
          } }],
        });
      } });
    }
    showActionMenu(menuBtn, items);
  });

  container.append(
    el('div', { class: 'navbar' }, [
      el('div', { class: 'navbar-row', style: 'padding-left:4px' }, [backBtn, el('h1', { class: 'navbar-title', style: 'margin:0' }, 'Trainingsplan'), menuBtn]),
    ]),
    photoInput, pdfInput,
  );

  if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }

  if (!document_) {
    container.append(
      el('div', { class: 'plan-preview' }, [
        el('div', { html: icon('docImage', { size: 40 }), style: 'color:var(--text-tertiary);margin-top:40px' }),
        el('h3', { style: 'margin:0' }, 'Kein Trainingsplan hochgeladen'),
        el('p', { class: 'text-secondary', style: 'text-align:center;margin:0' }, 'Lade ein Foto oder PDF deines Trainingsplans hoch, um ihn jederzeit griffbereit zu haben.'),
        el('div', { class: 'plan-empty-actions' }, [
          el('button', { class: 'btn btn-primary', onclick: () => photoInput.click() }, 'Foto auswählen'),
          el('button', { class: 'btn btn-secondary', onclick: () => pdfInput.click() }, 'PDF auswählen'),
        ]),
      ]),
    );
    return;
  }

  currentObjectUrl = URL.createObjectURL(document_.blob);
  const isPdf = document_.blob.type === 'application/pdf' || document_.fileName.toLowerCase().endsWith('.pdf');
  container.append(
    el('div', { class: 'plan-preview' }, [
      isPdf
        ? el('embed', { src: currentObjectUrl, type: 'application/pdf' })
        : el('img', { src: currentObjectUrl, alt: 'Trainingsplan' }),
    ]),
  );
}
