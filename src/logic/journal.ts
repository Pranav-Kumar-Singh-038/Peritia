import type { AppState, ActivityEvent } from '../types';
import { addDays, dateKey, lastNDays, todayKey } from '../utils/date';

export function buildActivityCounts(state: AppState): Record<string, number> {
  const counts: Record<string, number> = {};
  const add = (key: string) => {
    counts[key] = (counts[key] ?? 0) + 1;
  };
  for (const completion of state.completions) add(completion.completedAt.slice(0, 10));
  for (const checkin of state.dailyCheckins) add(checkin.date);
  for (const checkin of state.financeCheckins) add(checkin.createdAt.slice(0, 10));
  for (const assessment of state.assessments) add(assessment.createdAt.slice(0, 10));
  return counts;
}

export interface WeeklyPoint {
  key: string;
  label: string;
  value: number;
}

export function weeklyXp(state: AppState): WeeklyPoint[] {
  const days = lastNDays(7);
  return days.map((day) => {
    const value = state.completions
      .filter((completion) => completion.completedAt.slice(0, 10) === day)
      .reduce((sum, completion) => sum + completion.xp, 0);
    const date = new Date(`${day}T12:00:00`);
    return {
      key: day,
      label: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      value,
    };
  });
}

export function activityStats(state: AppState) {
  const today = todayKey();
  const last30 = addDays(today, -29);
  const activeDays = new Set<string>();
  for (const completion of state.completions) {
    if (completion.completedAt.slice(0, 10) >= last30) activeDays.add(completion.completedAt.slice(0, 10));
  }
  for (const checkin of state.dailyCheckins) {
    if (checkin.date >= last30) activeDays.add(checkin.date);
  }
  const weekStart = addDays(today, -6);
  const weekXp = state.completions
    .filter((completion) => completion.completedAt.slice(0, 10) >= weekStart)
    .reduce((sum, completion) => sum + completion.xp, 0);
  return {
    totalQuests: state.completions.length,
    activeDays: activeDays.size,
    weekXp,
    assessments: state.assessments.length,
    streak: state.streak.current,
  };
}

export function eventsGroupedByDay(events: ActivityEvent[]): Array<{ day: string; events: ActivityEvent[] }> {
  const groups = new Map<string, ActivityEvent[]>();
  for (const event of [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const day = event.createdAt.slice(0, 10);
    const list = groups.get(day) ?? [];
    list.push(event);
    groups.set(day, list);
  }
  return [...groups.entries()].map(([day, list]) => ({ day, events: list }));
}

export function eventDayLabel(day: string): string {
  if (day === dateKey()) return 'Today';
  if (day === addDays(dateKey(), -1)) return 'Yesterday';
  const date = new Date(`${day}T12:00:00`);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
