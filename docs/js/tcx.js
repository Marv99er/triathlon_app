// Port von Models/GarminTCXParser.swift: liest eine Garmin-TCX-Datei und fasst alle Laps
// einer Aktivität zusammen. Wichtig: TotalTimeSeconds/DistanceMeters nur zählen, wenn das
// direkte Elternelement <Lap> ist (Trackpoints tragen dieselben Feldnamen -> sonst Doppelzählung).
export function parseTCX(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) return null;

  const activity = doc.querySelector('Activity');
  if (!activity) return null;
  const activitySport = activity.getAttribute('Sport');
  const activityIdEl = activity.querySelector(':scope > Id');
  const activityId = activityIdEl ? activityIdEl.textContent.trim() : null;

  let totalSeconds = 0;
  let totalMeters = 0;
  let weightedHeartRateSum = 0;
  let weightedHeartRateSeconds = 0;
  let maxHeartRate = null;
  let earliestStartTime = null;

  const laps = activity.querySelectorAll(':scope > Lap');
  for (const lap of laps) {
    const startTime = lap.getAttribute('StartTime');
    const totalTimeEl = lap.querySelector(':scope > TotalTimeSeconds');
    const distanceEl = lap.querySelector(':scope > DistanceMeters');
    const avgHrEl = lap.querySelector(':scope > AverageHeartRateBpm > Value');
    const maxHrEl = lap.querySelector(':scope > MaximumHeartRateBpm > Value');

    const seconds = totalTimeEl ? parseFloat(totalTimeEl.textContent) : 0;
    totalSeconds += seconds || 0;
    totalMeters += distanceEl ? parseFloat(distanceEl.textContent) || 0 : 0;

    if (avgHrEl) {
      const avg = parseFloat(avgHrEl.textContent);
      if (!isNaN(avg)) {
        weightedHeartRateSum += avg * seconds;
        weightedHeartRateSeconds += seconds;
      }
    }
    if (maxHrEl) {
      const max = parseFloat(maxHrEl.textContent);
      if (!isNaN(max)) maxHeartRate = Math.max(maxHeartRate ?? 0, max);
    }
    if (startTime && (!earliestStartTime || startTime < earliestStartTime)) {
      earliestStartTime = startTime;
    }
  }

  if (totalSeconds <= 0) return null;

  const dateSource = earliestStartTime ?? activityId;
  const parsedDate = dateSource ? new Date(dateSource) : new Date();
  const date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  let sportType = null;
  if (activitySport === 'Running') sportType = 'run';
  else if (activitySport === 'Biking') sportType = 'bike';

  return {
    date: date.toISOString(),
    sportType,
    durationSeconds: Math.round(totalSeconds),
    distanceKm: totalMeters > 0 ? totalMeters / 1000 : null,
    avgHeartRate: weightedHeartRateSeconds > 0 ? Math.round(weightedHeartRateSum / weightedHeartRateSeconds) : null,
    maxHeartRate: maxHeartRate != null ? Math.round(maxHeartRate) : null,
  };
}
