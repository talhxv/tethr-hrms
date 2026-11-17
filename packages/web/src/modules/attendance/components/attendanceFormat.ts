const SECONDS_PER_HOUR = 3600;

const pad = (value: number): string => String(value).padStart(2, '0');

/** 3h 05m, or 16m under an hour — for totals, where seconds are noise. */
export const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / 60);
  return hours > 0 ? `${hours}h ${pad(minutes)}m` : `${minutes}m`;
};

/** formatDuration for a decimal hour figure (0.22 → "13m"). */
export const formatHours = (hours: number): string =>
  formatDuration(Math.round(hours * SECONDS_PER_HOUR));
