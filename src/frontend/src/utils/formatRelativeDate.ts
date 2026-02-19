const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH = 2592000;
const YEAR = 31536000;

export function formatRelativeDate(dateString: string, now: number = Date.now()): string {
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  const diffSeconds = Math.round((new Date(dateString).getTime() - now) / 1000);
  const abs = Math.abs(diffSeconds);

  if (abs < MINUTE) return rtf.format(0, 'second');
  if (abs < HOUR) return rtf.format(Math.round(diffSeconds / MINUTE), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diffSeconds / HOUR), 'hour');
  if (abs < MONTH) return rtf.format(Math.round(diffSeconds / DAY), 'day');
  if (abs < YEAR) return rtf.format(Math.round(diffSeconds / MONTH), 'month');
  return rtf.format(Math.round(diffSeconds / YEAR), 'year');
}
