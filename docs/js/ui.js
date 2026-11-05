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

// ---------- Reihenfolge ändern: Karte gedrückt halten oder am Griff ziehen ----------

const LONG_PRESS_MS = 400;
const HANDLE_PRESS_MS = 120;
const MOVE_TOLERANCE_PX = 10;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function enableDragReorder(card, { handle, index, rows, onMove }) {
  let press = null;
  let overlay = null;

  function startPress(target, x, y) {
    const onHandle = handle.contains(target);
    // Im Feld, in dem gerade getippt wird, setzt Halten den Cursor und hebt nichts an
    if (!onHandle && target === document.activeElement) return;
    press = { startX: x, startY: y, y, onHandle, timer: setTimeout(lift, onHandle ? HANDLE_PRESS_MS : LONG_PRESS_MS) };
    card.classList.add('pressing');
  }

  function cancelPress() {
    if (!press) return;
    clearTimeout(press.timer);
    card.classList.remove('pressing');
    press = null;
  }

  function lift() {
    const { y } = press;
    cancelPress();
    document.activeElement?.blur();
    overlay = openReorderOverlay(rows(), index, y, card.closest('.modal-body'));
  }

  function movePress(x, y) {
    if (overlay) { overlay.move(y); return; }
    if (!press) return;
    press.y = y;
    if (Math.hypot(x - press.startX, y - press.startY) <= MOVE_TOLERANCE_PX) return;
    // Am Griff heißt Bewegung ziehen, überall sonst scrollen
    if (press.onHandle) { clearTimeout(press.timer); lift(); } else cancelPress();
  }

  function endPress() {
    if (overlay) {
      const to = overlay.close();
      overlay = null;
      if (to !== index) onMove(index, to);
    } else if (press?.onHandle) {
      showToast('Zum Verschieben halten und ziehen');
    }
    cancelPress();
  }

  function abortPress() {
    if (overlay) { overlay.close(); overlay = null; }
    cancelPress();
  }

  card.addEventListener('touchstart', (e) => {
    if (e.targetTouches.length > 1) { if (!overlay) cancelPress(); return; }
    startPress(e.target, e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  }, { passive: true });
  // passive: false muss schon vor dem Berühren feststehen, sonst lässt sich das Scrollen auf dem iPhone nicht mehr stoppen
  card.addEventListener('touchmove', (e) => {
    if (overlay) e.preventDefault();
    movePress(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  }, { passive: false });
  card.addEventListener('touchend', (e) => {
    if (e.targetTouches.length) return;
    // Ein Antippen nach dem Ablegen darf weder ein Feld fokussieren noch einen Button auslösen
    if (overlay) e.preventDefault();
    endPress();
  });
  card.addEventListener('touchcancel', abortPress);

  card.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    startPress(e.target, e.clientX, e.clientY);
    const onPointerMove = (ev) => movePress(ev.clientX, ev.clientY);
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      endPress();
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });
}

// Karten sind oft fast bildschirmhoch. Beim Anheben klappt alles zu einer kurzen Liste zusammen,
// in der jede Position ohne Scrollen erreichbar ist. Die Karten darunter bleiben unangetastet.
function openReorderOverlay(rows, from, startY, scroller) {
  const hint = el('div', { class: 'section-title reorder-hint' }, 'Ziehen und loslassen');
  const list = el('div', { class: 'reorder-list' });
  const overlay = el('div', { class: 'reorder-overlay' }, [hint, list]);
  root.append(overlay);
  scroller.style.overflow = 'hidden';

  const minTop = hint.getBoundingClientRect().bottom;
  const maxBottom = window.innerHeight - 40;
  const rowHeight = Math.min(64, (maxBottom - minTop) / rows.length);
  const listTop = clamp(startY - (from + 0.5) * rowHeight, minTop, maxBottom - rows.length * rowHeight);
  list.style.top = `${listTop}px`;

  const place = (row, slot) => { row.style.transform = `translateY(${slot * rowHeight}px)`; };
  const rowEls = rows.map(({ title, meta }, i) => {
    const row = el('div', { class: `reorder-row${i === from ? ' active' : ''}`, style: `height:${rowHeight}px` }, [
      el('div', { class: 'reorder-plate' }, [
        el('span', { class: 'reorder-grip', html: icon('grip', { size: 22, stroke: 3 }) }),
        el('span', { class: 'reorder-title' }, title),
        el('span', { class: 'reorder-meta' }, meta),
      ]),
    ]);
    place(row, i);
    list.append(row);
    return row;
  });

  // Zählt nur die Bewegung seit dem Anheben, die Zeile springt also nie von selbst auf einen anderen Platz.
  // Reicht der Platz bis zum Bildschirmrand nicht, genügt ein kürzerer Weg pro Position, damit jede erreichbar bleibt.
  const lastIndex = rows.length - 1;
  const pxPerSlotUp = from > 0 ? Math.min(rowHeight, Math.max(1, startY - minTop) / from) : rowHeight;
  const pxPerSlotDown = from < lastIndex ? Math.min(rowHeight, Math.max(1, window.innerHeight - 16 - startY) / (lastIndex - from)) : rowHeight;

  let target = from;
  function move(y) {
    const delta = y - startY;
    const slot = clamp(from + delta / (delta < 0 ? pxPerSlotUp : pxPerSlotDown), -0.5, lastIndex + 0.5);
    place(rowEls[from], slot);
    const next = clamp(Math.round(slot), 0, lastIndex);
    if (next === target) return;
    target = next;
    rowEls.forEach((row, i) => {
      if (i === from) return;
      if (i > from && i <= target) place(row, i - 1);
      else if (i < from && i >= target) place(row, i + 1);
      else place(row, i);
    });
  }
  move(startY);

  return {
    move,
    close() {
      scroller.style.overflow = '';
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 160);
      return target;
    },
  };
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
