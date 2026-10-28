export const SPORT_TYPES = {
  swim: { displayName: 'Schwimmen', tint: '#0A84FF', icon: 'swim', tracksDistance: true },
  bike: { displayName: 'Radfahren', tint: '#FF9F0A', icon: 'bike', tracksDistance: true },
  run: { displayName: 'Laufen', tint: '#30D158', icon: 'run', tracksDistance: true },
  strength: { displayName: 'Kraft', tint: '#BF5AF2', icon: 'strength', tracksDistance: false },
};

export const SELECTABLE_SPORTS = ['swim', 'bike', 'run'];
export const WEEKDAY_NAMES = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
export const WEEKDAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes} min` : `${minutes}:${String(seconds).padStart(2, '0')} min`;
}

export function formatClock(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatPaceValue(secondsPerUnit) {
  const minutes = Math.floor(secondsPerUnit / 60);
  const seconds = Math.floor(secondsPerUnit) % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')} min`;
}

export function averagePace(workout) {
  const sport = SPORT_TYPES[workout.sportType];
  if (!sport || !sport.tracksDistance || !workout.distanceKm || workout.distanceKm <= 0 || !workout.durationSeconds) {
    return null;
  }
  const totalSeconds = workout.durationSeconds;
  if (workout.sportType === 'run') {
    return formatPaceValue(totalSeconds / workout.distanceKm) + '/km';
  }
  if (workout.sportType === 'swim') {
    return formatPaceValue(totalSeconds / (workout.distanceKm * 10)) + '/100m';
  }
  if (workout.sportType === 'bike') {
    const kmh = workout.distanceKm / (totalSeconds / 3600);
    return formatNumber(kmh, 0, 1) + ' km/h';
  }
  return null;
}

export function formatNumber(value, minFrac = 0, maxFrac = 2) {
  return value.toLocaleString('de-DE', { minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac });
}

export function formatDateShort(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export function formatDateAbbrev(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

export function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Montag
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function endOfWeek(date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function exerciseSummary(exercise) {
  return exercise.sets
    .map(set => (set.weightKg != null ? `${set.reps ?? '–'}×${formatNumber(set.weightKg, 0, 1)}kg` : `${set.reps ?? '–'}×`))
    .join(', ');
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else if (value !== null && value !== undefined) node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function weekdayFromDate(date) {
  // 1 = Montag ... 7 = Sonntag
  const js = date.getDay();
  return js === 0 ? 7 : js;
}

export function toDateInputValue(date) {
  const d = new Date(date);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function toDateTimeInputValue(date) {
  const d = new Date(date);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}
