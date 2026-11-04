export const SPORT_TYPES = {
  swim: { displayName: 'Schwimmen', shortName: 'Swim', letter: 'S', icon: 'swim', tracksDistance: true },
  bike: { displayName: 'Rad', shortName: 'Bike', letter: 'R', icon: 'bike', tracksDistance: true },
  run: { displayName: 'Laufen', shortName: 'Run', letter: 'L', icon: 'run', tracksDistance: true },
  strength: { displayName: 'Kraft', shortName: 'Kraft', letter: 'K', icon: 'strength', tracksDistance: false },
};

// Schwarzer Kreis mit weißem Buchstaben: das eine Zeichen für jede Disziplin; idle = in dieser Woche noch nichts
export function sportCap(sportType, { size = 28, idle = false } = {}) {
  return el('span', {
    class: `cap sport${idle ? ' empty' : ''}`,
    'aria-hidden': 'true',
    style: `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.56)}px`,
  }, SPORT_TYPES[sportType].letter);
}

// Schwimmen wird in Metern gedacht, Rad und Lauf in Kilometern.
export function formatDistance(sportType, km) {
  if (sportType === 'swim') return `${formatNumber(Math.round(km * 1000), 0, 0)} m`;
  return `${formatNumber(km, 0, 1)} km`;
}

export function formatHours(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')} h` : `${minutes} min`;
}

export function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(date) {
  return Math.round((startOfDay(date) - startOfDay(new Date())) / 86400000);
}

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
    // Ohne Zusatzgewicht (z. B. Klimmzüge) nur die Wiederholungen statt "8×0kg"
    .map(set => (set.weightKg ? `${set.reps ?? '–'}×${formatNumber(set.weightKg, 0, 1)} kg` : `${set.reps ?? '–'} Wdh.`))
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
