export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type DraftDay = typeof weekdays[number];
export function draftDay(value: string | undefined): DraftDay {
  if (value === undefined) return 'Thursday';
  const day = weekdays.find(day => day.toLowerCase() === value.trim().toLowerCase());
  if (!day) throw new Error('Meal planning configuration unavailable');
  return day;
}
function isoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= '0001-01-01' && value <= '9999-12-31' && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function addDays(date: string, days: number): string {
  if (!isoDate(date) || !Number.isInteger(days)) throw new Error('Invalid calendar date');
  const result = new Date(date + 'T12:00:00Z'); result.setUTCDate(result.getUTCDate() + days);
  const next = result.toISOString().slice(0, 10);
  if (!isoDate(next)) throw new Error('Invalid calendar date');
  return next;
}
export function parseWeek(value: unknown): string | null { return isoDate(value) && new Date(value + 'T12:00:00Z').getUTCDay() === 0 ? value : null; }
export function torontoClock(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'long' }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)!.value;
  return { date: `${part('year')}-${part('month')}-${part('day')}`, day: part('weekday') as DraftDay, hour: Number(part('hour')) };
}
export function currentWeek(now: Date): string { const local = torontoClock(now); return addDays(local.date, -weekdays.indexOf(local.day)); }
export function dueWeek(now: Date, day: DraftDay): string | null {
  const local = torontoClock(now);
  return local.day === day && local.hour >= 9 ? addDays(local.date, 7 - weekdays.indexOf(local.day)) : null;
}
