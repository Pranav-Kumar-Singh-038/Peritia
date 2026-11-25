import type {
  AppState,
  MetricDef,
  QuestDef,
  RankGate,
  RankGateCriterion,
  SkillId,
  SkillState,
} from '../types';
import { clamp, toRoman } from '../utils/format';

export const GENERIC_RANKS = [
  'Novice',
  'Apprentice',
  'Adept',
  'Skilled',
  'Proficient',
  'Advanced',
  'Expert',
  'Elite',
  'Master',
  'Grandmaster',
];

export const FINANCE_RANKS = [
  'Survival',
  'Stability',
  'Control',
  'Buffer',
  'Builder',
  'Compounder',
  'Optionality',
  'Leverage',
  'Independence',
  'Abundance',
];

export function rankIndexForLevel(level: number): number {
  return clamp(Math.floor(level / 10), 0, 9);
}

export function rankNameForLevel(level: number, skillId?: SkillId): string {
  const index = rankIndexForLevel(level);
  return skillId === 'finance' ? FINANCE_RANKS[index] : GENERIC_RANKS[index];
}

export function rankLabelForLevel(level: number, skillId?: SkillId): string {
  const index = rankIndexForLevel(level);
  return `${rankNameForLevel(level, skillId)} ${toRoman(index + 1)}`;
}

export function levelCeilingForRank(rank: number): number {
  if (rank >= 9) return 100;
  return (rank + 1) * 10 - 1;
}

export function computeWeightedScore(
  metrics: MetricDef[],
  scores: Record<string, number> | null | undefined,
): number {
  if (!scores) return 0;
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  if (totalWeight <= 0) return 0;
  const total = metrics.reduce(
    (sum, metric) => sum + (scores[metric.key] ?? 0) * metric.weight,
    0,
  );
  return clamp(total / totalWeight, 0, 100);
}

export function skillById(state: AppState, id: SkillId): SkillState {
  return state.skills.find((skill) => skill.id === id) ?? state.skills[0];
}

export function skillLevel(state: AppState, id: SkillId): number {
  return skillById(state, id)?.level ?? 0;
}

export function applyPracticeXp(
  skill: SkillState,
  amount: number,
): { skill: SkillState; levelsGained: number; atGate: boolean } {
  if (skill.type === 'continuous' || amount <= 0) {
    return { skill, levelsGained: 0, atGate: false };
  }
  const rank = rankIndexForLevel(skill.level);
  const ceiling = levelCeilingForRank(rank);
  let level = skill.level;
  let xp = skill.xp + amount;
  let levelsGained = 0;

  while (xp >= 100 && level < ceiling) {
    level += 1;
    xp -= 100;
    levelsGained += 1;
  }

  if (level >= ceiling) {
    xp = Math.min(99, xp);
  }

  return {
    skill: { ...skill, level, xp },
    levelsGained,
    atGate: level >= ceiling && rank < 9,
  };
}

export function secondaryXp(amount: number): number {
  return Math.floor(amount * 0.25);
}

export function getRankGate(
  skill: SkillState,
  metDemoKeys: string[],
  scoresOverride?: Record<string, number>,
): RankGate | null {
  if (skill.type === 'continuous' || !skill.assessedAt) return null;
  const currentRank = rankIndexForLevel(skill.level);
  if (currentRank >= 9) return null;

  const targetRank = currentRank + 1;
  const targetLevel = targetRank * 10;
  const targetRankName = `${rankNameForLevel(targetLevel)} ${toRoman(targetRank + 1)}`;
  const demoKey = `demo-${skill.id}-r${targetRank}`;
  const demoTitle = skill.demoTitles[targetRank - 1] ?? 'Demonstrate your proficiency';
  const scores = scoresOverride ?? skill.scores ?? {};
  const weighted = computeWeightedScore(skill.metrics, scores);
  const minMetric = Math.min(90, 20 + targetRank * 7);

  const criteria: RankGateCriterion[] = [
    {
      key: `${demoKey}-overall`,
      type: 'overall',
      title: `Overall score ${targetLevel}+`,
      description: `Reach a weighted metric score of at least ${targetLevel}.`,
      minScore: targetLevel,
      met: weighted >= targetLevel,
    },
    ...skill.keyMetrics.map((key) => {
      const metric = skill.metrics.find((m) => m.key === key);
      return {
        key: `${demoKey}-${key}`,
        type: 'metric' as const,
        title: `${metric?.label ?? key} ${minMetric}+`,
        description: metric?.description ?? 'Reach the required metric standard.',
        metricKey: key,
        minScore: minMetric,
        met: (scores[key] ?? 0) >= minMetric,
      };
    }),
    {
      key: demoKey,
      type: 'demonstration',
      title: demoTitle,
      description: 'Complete this as your main quest to prove the rank standard.',
      demoKey,
      met: metDemoKeys.includes(demoKey),
    },
  ];

  return {
    skillId: skill.id,
    currentRank,
    targetRank,
    targetLevel,
    targetRankName,
    criteria,
    demoKey,
    demoTitle,
    allMet: criteria.every((criterion) => criterion.met),
  };
}

export interface AssessmentResolution {
  weightedScore: number;
  newLevel: number;
  newRank: number;
  passedGate: boolean;
  gateNotes?: string;
  atGate: boolean;
}

export function resolveAssessment(
  skill: SkillState,
  scores: Record<string, number>,
  mode: 'initial' | 'reassessment' | 'rank-trial',
  metDemoKeys: string[],
): AssessmentResolution {
  const weightedScore = computeWeightedScore(skill.metrics, scores);
  const previousRank = rankIndexForLevel(skill.level);
  const previousCeiling = levelCeilingForRank(previousRank);

  if (mode === 'initial') {
    const newLevel = Math.round(weightedScore);
    return {
      weightedScore,
      newLevel,
      newRank: rankIndexForLevel(newLevel),
      passedGate: true,
      atGate: newLevel >= previousCeiling,
    };
  }

  if (Math.round(weightedScore) <= previousCeiling) {
    const newLevel = Math.round(weightedScore);
    return {
      weightedScore,
      newLevel,
      newRank: rankIndexForLevel(newLevel),
      passedGate: true,
      atGate: newLevel >= previousCeiling,
    };
  }

  const gate = getRankGate(skill, metDemoKeys, scores);
  if (gate?.allMet) {
    const newLevel = Math.min(
      Math.round(weightedScore),
      levelCeilingForRank(previousRank + 1),
    );
    return {
      weightedScore,
      newLevel,
      newRank: rankIndexForLevel(newLevel),
      passedGate: true,
      atGate: false,
    };
  }

  const unmet = gate?.criteria.filter((c) => !c.met) ?? [];
  return {
    weightedScore,
    newLevel: previousCeiling,
    newRank: previousRank,
    passedGate: false,
    gateNotes: unmet.length
      ? unmet.map((criterion) => criterion.title).join(' · ')
      : 'Rank gate requirements are not met yet.',
    atGate: true,
  };
}

export function mainQuestForSkill(skill: SkillState): QuestDef | null {
  if (skill.type === 'continuous' || !skill.assessedAt) return null;
  const gate = getRankGate(skill, []);
  if (!gate) return null;
  return {
    id: `main-${skill.id}-r${gate.targetRank}`,
    title: gate.demoTitle,
    description: `A rank-gate demonstration for ${gate.targetRankName}. Log three deliberate attempts.`,
    skillId: skill.id,
    kind: 'main',
    source: 'curated',
    difficulty: 'hard',
    xp: 50,
    targetCount: 3,
    repeatable: false,
    demoKey: gate.demoKey,
  };
}

export function availableMainQuests(state: AppState): QuestDef[] {
  return state.skills
    .map((skill) => mainQuestForSkill(skill))
    .filter((quest): quest is QuestDef => Boolean(quest));
}

export function activeMainQuest(state: AppState) {
  return state.activeQuests.find((quest) => quest.kind === 'main') ?? null;
}

export function rankGateSummary(gate: RankGate | null): string {
  if (!gate) return 'Max rank reached';
  const met = gate.criteria.filter((criterion) => criterion.met).length;
  return `${met}/${gate.criteria.length} criteria met`;
}
