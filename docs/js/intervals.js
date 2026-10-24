// Garmin-Abgleich über intervals.icu: holt die letzten Trainings und legt sie als Workouts an.
// Garmin Connect -> intervals.icu -> TriLog. Der API-Schlüssel liegt nur in localStorage auf diesem Gerät.
import { db, uuid } from './db.js';
import { toDateInputValue } from './utils.js';

const KEY_STORAGE = 'intervalsApiKey';
const IGNORED_STORAGE = 'intervalsIgnored';
const WINDOW_DAYS = 30;
const MIN_INTERVAL_MS = 60 * 1000;

// Nur diese intervals.icu-Typen werden übernommen (Kraft und der Rest bleiben bewusst draußen).
const SPORT_BY_TYPE = {
  Run: 'run', TrailRun: 'run', VirtualRun: 'run',
  Ride: 'bike', VirtualRide: 'bike', GravelRide: 'bike', MountainBikeRide: 'bike',
  EBikeRide: 'bike', EMountainBikeRide: 'bike',
  Swim: 'swim', OpenWaterSwim: 'swim',
};

let lastSyncAt = 0;

export function getApiKey() {
  try { return localStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; }
}

export function setApiKey(value) {
  try {
    if (value) localStorage.setItem(KEY_STORAGE, value.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch { /* Speicher nicht verfügbar */ }
}

function ignoredIds() {
  try { return JSON.parse(localStorage.getItem(IGNORED_STORAGE)) || []; } catch { return []; }
}

// Gelöschte Garmin-Trainings sollen beim nächsten Abgleich nicht wieder auftauchen.
export function ignoreIntervalsActivity(intervalsId) {
  if (!intervalsId) return;
  try {
    localStorage.setItem(IGNORED_STORAGE, JSON.stringify([...new Set([...ignoredIds(), intervalsId])]));
  } catch { /* Speicher nicht verfügbar */ }
}

export function mapActivity(a) {
  const sportType = SPORT_BY_TYPE[a.type];
  if (!sportType || !a.id || !a.start_date_local || !(a.moving_time > 0)) return null;
  const date = new Date(a.start_date_local);
  if (isNaN(date.getTime())) return null;
  return {
    intervalsId: String(a.id),
    sportType,
    date: date.toISOString(),
    durationSeconds: Math.round(a.moving_time),
    distanceKm: a.distance > 0 ? Math.round(a.distance / 10) / 100 : null,
    avgHeartRate: a.average_heartrate ? Math.round(a.average_heartrate) : null,
    maxHeartRate: a.max_heartrate ? Math.round(a.max_heartrate) : null,
  };
}

// Überschreibt nur die gemessenen Werte; Notizen und RPE bleiben unangetastet.
function applyMeasured(workout, m) {
  let changed = false;
  for (const field of ['date', 'durationSeconds', 'distanceKm', 'avgHeartRate', 'maxHeartRate']) {
    if (workout[field] !== m[field]) { workout[field] = m[field]; changed = true; }
  }
  return changed;
}

// Reine Funktion: liefert die Workouts, die gespeichert werden müssen.
export function mergeActivities(activities, workouts, ignored = []) {
  const linked = new Map(workouts.filter(w => w.intervalsId).map(w => [w.intervalsId, w]));
  const claimed = new Set();
  const toSave = [];
  const pending = [];

  for (const m of activities.map(mapActivity)) {
    if (!m || ignored.includes(m.intervalsId)) continue;
    const existing = linked.get(m.intervalsId);
    if (existing) {
      claimed.add(existing.id);
      if (applyMeasured(existing, m)) toSave.push(existing);
    } else {
      pending.push(m);
    }
  }

  for (const m of pending) {
    const day = toDateInputValue(m.date);
    const target = workouts
      .filter(w => !w.intervalsId && !claimed.has(w.id) && w.sportType === m.sportType && toDateInputValue(w.date) === day)
      .sort((a, b) => Math.abs(a.durationSeconds - m.durationSeconds) - Math.abs(b.durationSeconds - m.durationSeconds))[0];

    if (target) {
      claimed.add(target.id);
      applyMeasured(target, m);
      target.intervalsId = m.intervalsId;
      toSave.push(target);
    } else {
      toSave.push({
        id: uuid(), strengthExercises: [], routineName: null, bodyWeightKg: null, rpe: null, notes: null,
        ...m,
      });
    }
  }
  return toSave;
}

// Rückgabe: { status: 'ok' | 'no-key' | 'skipped', changed } – wirft bei Netz-/Zugriffsfehlern.
export async function syncIntervals({ force = false } = {}) {
  const key = getApiKey();
  if (!key) return { status: 'no-key', changed: 0 };
  if (!force && Date.now() - lastSyncAt < MIN_INTERVAL_MS) return { status: 'skipped', changed: 0 };
  lastSyncAt = Date.now();

  const day = 24 * 3600 * 1000;
  const oldest = toDateInputValue(Date.now() - WINDOW_DAYS * day);
  const newest = toDateInputValue(Date.now() + day);
  const res = await fetch(`https://intervals.icu/api/v1/athlete/0/activities?oldest=${oldest}&newest=${newest}`, {
    headers: { Authorization: 'Basic ' + btoa('API_KEY:' + key) },
  });
  if (res.status === 401 || res.status === 403) throw new Error('auth');
  if (!res.ok) throw new Error('http ' + res.status);

  const activities = await res.json();
  const toSave = mergeActivities(activities, await db.getAll('workouts'), ignoredIds());
  for (const workout of toSave) await db.put('workouts', workout);
  return { status: 'ok', changed: toSave.length };
}
