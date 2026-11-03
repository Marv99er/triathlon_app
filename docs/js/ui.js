import { el } from './utils.js';
import { icon } from './icons.js';

const root = document.getElementById('overlays');

// ---------- Sheet (ersetzt SwiftUI .sheet) ----------

export function openSheet({
  title, leftLabel = 'Abbrechen', onCancel, onSave, saveLabel = 'Sichern', saveDisabled = false,
  rightIcon, onRightIconClick, noRightButton = false, render,
}) {
  const backdrop = el('div', { class: 'modal-backdrop' });
  const sheet = el('div', { class: 'modal-sheet' });

  let rightBtn;
  if (noRightButton) {
    rightBtn = el('div', { class: 'navbar-spacer' });
  } else if (rightIcon) {
    rightBtn = el('button', { class: 'icon-btn', 'aria-label': rightIcon === 'ellipsis' ? 'Weitere Aktionen' : rightIcon, html: icon(rightIcon, { size: 22 }), onclick: (e) => onRightIconClick && onRightIconClick(e, close) });
  } else {
    rightBtn = el('button', {
      class: 'navbar-btn bold',
      onclick: () => { if (onSave) onSave(close); },
    }, saveLabel);
    if (saveDisabled) rightBtn.disabled = true;
  }

  const navbar = el('div', { class: 'navbar' }, [
    el('div', { class: 'navbar-row' }, [
      el('button', { class: 'navbar-btn', onclick: () => close(true) }, leftLabel),
      el('div', { class: 'navbar-title' }, title),
      rightBtn,
    ]),
  ]);

  const body = el('div', { class: 'modal-body' });
  sheet.append(navbar, body);
  backdrop.append(sheet);
  root.append(backdrop);

  function close(cancelled) {
    if (cancelled && onCancel) onCancel();
    backdrop.classList.remove('open');
    setTimeout(() => backdrop.remove(), 300);
  }

  requestAnimationFrame(() => backdrop.classList.add('open'));

  const api = {
    body,
    close,
    setSaveDisabled(value) { rightBtn.disabled = value; },
    setTitle(value) { navbar.querySelector('.navbar-title').textContent = value; },
  };

  if (render) render(api);
  return api;
}

// ---------- Dauerfeld h:mm:ss (Trainings und Rennen nutzen dasselbe) ----------

export function durationRow(label, seconds) {
  const total = seconds || 0;
  const pad = (n) => String(n).padStart(2, '0');
  const field = (aria, value, placeholder) => el('input', { type: 'number', inputmode: 'numeric', min: '0', 'aria-label': aria, value, placeholder });
  const inputs = {
    h: field('Stunden', total ? Math.floor(total / 3600) : '', 'h'),
    m: field('Minuten', total ? pad(Math.floor((total % 3600) / 60)) : '', 'mm'),
    s: field('Sekunden', total ? pad(total % 60) : '', 'ss'),
  };
  const row = el('div', { class: 'form-row' }, [
    el('label', { class: 'form-label' }, label),
    el('div', { class: 'duration-field' }, [inputs.h, el('span', {}, ':'), inputs.m, el('span', {}, ':'), inputs.s]),
  ]);
  const read = () => {
    const v = (i) => Math.max(0, parseInt(i.value, 10) || 0);
    return v(inputs.h) * 3600 + v(inputs.m) * 60 + Math.min(59, v(inputs.s));
  };
  return { row, read, inputs };
}

// ---------- Hauptaktion: das + in der Mitte der Tab-Leiste, jede Seite legt fest, was es tut ----------

let primaryAction = null;

export function fab(label, onClick) {
  const btn = document.getElementById('primary-action');
  btn.setAttribute('aria-label', label);
  primaryAction = onClick;
  return btn;
}

export function triggerPrimaryAction(btn) {
  if (primaryAction) primaryAction(btn);
}

// ---------- Action menu (ersetzt SwiftUI Menu) ----------

let openMenuCleanup = null;

export function showActionMenu(anchorEl, items) {
  closeActionMenu();
  const scrim = el('div', { class: 'scrim open', onclick: closeActionMenu });
  const menu = el('div', { class: 'action-menu' });
  for (const item of items) {
    menu.append(
      el('button', {
        class: item.destructive ? 'destructive' : '',
        onclick: () => { closeActionMenu(); item.onClick(); },
      }, [
        el('span', { html: icon(item.icon, { size: 20 }), style: 'display:flex;color:var(--text-secondary)', 'aria-hidden': 'true' }),
        el('span', {}, item.label),
      ])
    );
  }
  root.append(scrim, menu);

  const rect = anchorEl.getBoundingClientRect();
  const menuWidth = 240;
  let left = rect.right - menuWidth;
  left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
  let top = rect.bottom + 6;
  if (top + items.length * 52 + 8 > window.innerHeight) top = rect.top - 6 - items.length * 52;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;

  openMenuCleanup = () => { scrim.remove(); menu.remove(); };
}

export function closeActionMenu() {
  if (openMenuCleanup) { openMenuCleanup(); openMenuCleanup = null; }
}

// ---------- Confirm dialog (ersetzt confirmationDialog) ----------

export function showConfirm({ title, actions }) {
  const scrim = el('div', { class: 'scrim open', onclick: close });
  const dialog = el('div', { class: 'confirm-dialog open' });

  const group = el('div', { class: 'group' });
  if (title) group.append(el('div', { class: 'form-row', style: 'justify-content:center;color:var(--text-secondary);font-size:13px;' }, title));
  for (const action of actions) {
    group.append(el('button', {
      class: action.destructive ? 'destructive' : '',
      onclick: () => { close(); action.onClick(); },
    }, action.label));
  }

  const cancelGroup = el('div', { class: 'group cancel-group' }, [
    el('button', { onclick: close }, 'Abbrechen'),
  ]);

  dialog.append(group, cancelGroup);
  root.append(scrim, dialog);

  function close() { scrim.remove(); dialog.remove(); }
}

// ---------- Toast ----------

let toastTimer = null;
export function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = el('div', { id: 'toast', class: 'toast' });
    root.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
