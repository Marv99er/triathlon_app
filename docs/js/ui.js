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
    rightBtn = el('button', { class: 'icon-btn', html: icon(rightIcon, { size: 22 }), onclick: (e) => onRightIconClick && onRightIconClick(e, close) });
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
        el('span', { html: icon(item.icon, { size: 18 }) }),
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
  if (top + 200 > window.innerHeight) top = rect.top - 6 - items.length * 44;
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
