import type { AppState, SkillState } from '../types';
import { daysBetween, todayKey } from '../utils/date';

export interface ReassessmentDue {
  skill: SkillState;
  days: number;
}

export function reassessmentsDue(state: AppState, intervalDays = 90): ReassessmentDue[] {
  const today = todayKey();
  return state.skills
    .filter((skill) => skill.type === 'assessed' && skill.assessedAt)
    .map((skill) => ({
      skill,
      days: daysBetween(skill.assessedAt!.slice(0, 10), today),
    }))
    .filter((item) => item.days >= intervalDays)
    .sort((a, b) => b.days - a.days);
}
