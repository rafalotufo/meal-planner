import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addDays, currentWeek, draftDay, dueWeek, parseWeek } from '../../lib/plans/calendar.ts';

test('Toronto due clock, strict subsequent Sunday, configuration and calendar boundaries', () => {
  assert.equal(draftDay(undefined), 'Thursday'); assert.equal(draftDay(' sUnDaY '), 'Sunday');
  for (const value of ['', 'Thurs', 'Monday!']) assert.throws(() => draftDay(value));
  assert.equal(dueWeek(new Date('2026-11-26T13:59:59Z'), 'Thursday'), null);
  assert.equal(dueWeek(new Date('2026-11-26T14:00:00Z'), 'Thursday'), '2026-11-29');
  assert.equal(dueWeek(new Date('2026-11-27T14:00:00Z'), 'Thursday'), null);
  assert.equal(dueWeek(new Date('2026-11-29T14:00:00Z'), 'Sunday'), '2026-12-06');
  assert.equal(dueWeek(new Date('2026-12-31T14:00:00Z'), 'Thursday'), '2027-01-03');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(currentWeek(new Date('2026-11-29T04:59:00Z')), '2026-11-22');
  for (const value of ['2026-02-29', '2026-11-30', '2026-1-04', 'bad']) assert.equal(parseWeek(value), null);
  assert.equal(parseWeek('2026-11-29'), '2026-11-29');
});
test('Toronto spring and fall DST use actual local hour and calendar arithmetic', () => {
  assert.equal(dueWeek(new Date('2026-03-08T12:59:00Z'), 'Sunday'), null);
  assert.equal(dueWeek(new Date('2026-03-08T13:00:00Z'), 'Sunday'), '2026-03-15');
  assert.equal(dueWeek(new Date('2026-11-01T13:59:00Z'), 'Sunday'), null);
  assert.equal(dueWeek(new Date('2026-11-01T14:00:00Z'), 'Sunday'), '2026-11-08');
});
