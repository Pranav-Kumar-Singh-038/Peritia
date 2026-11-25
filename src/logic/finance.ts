import type { FinanceCheckin, FinanceValues, RankGate, RankGateCriterion, SkillState } from '../types';
import { clamp, toRoman } from '../utils/format';
import { levelCeilingForRank, rankIndexForLevel } from './progression';

export const FINANCE_LADDER = [
  { rank: 'Survival', range: '0–9', gate: 'No stable income, or expenses exceed income' },
  { rank: 'Stability', range: '10–19', gate: 'Income covers essentials; tracking started' },
  { rank: 'Control', range: '20–29', gate: 'Income ≥ expenses; savings started' },
  { rank: 'Buffer', range: '30–39', gate: '3-month emergency fund; debt under control' },
  { rank: 'Builder', range: '40–49', gate: '20%+ savings rate; consistent investing' },
  { rank: 'Compounder', range: '50–59', gate: '6-month runway; passive income started' },
  { rank: 'Optionality', range: '60–69', gate: 'Passive income covers ~25% of expenses' },
  { rank: 'Leverage', range: '70–79', gate: 'Passive income covers ~50% of expenses' },
  { rank: 'Independence', range: '80–89', gate: 'Passive income covers baseline expenses' },
  { rank: 'Abundance', range: '90–100', gate: '25+ year runway; assets sustain lifestyle' },
];

export interface FinanceScore {
  incomeScore: number;
  savingsScore: number;
  emergencyScore: number;
  passiveScore: number;
  runwayScore: number;
  debtScore: number;
  savingsRate: number;
  weightedScore: number;
  level: number;
}

export function computeFinance(values: FinanceValues): FinanceScore {
  const { income, expenses, emergencyMonths, passiveIncome, runwayYears, debtToIncome } = values;
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  const incomeScore = expenses > 0 ? clamp((income / expenses) * 100, 0, 100) : income > 0 ? 100 : 0;
  const savingsScore = clamp((savingsRate / 0.4) * 100, 0, 100);
  const emergencyScore = clamp((emergencyMonths / 12) * 100, 0, 100);
  const passiveScore =
    expenses > 0 ? clamp((passiveIncome / expenses) * 100, 0, 100) : passiveIncome > 0 ? 100 : 0;
  const runwayScore = clamp((runwayYears / 25) * 100, 0, 100);
  const debtScore = clamp((1 - debtToIncome / 0.5) * 100, 0, 100);

  const weightedScore =
    incomeScore * 0.15 +
    savingsScore * 0.2 +
    emergencyScore * 0.2 +
    passiveScore * 0.2 +
    runwayScore * 0.15 +
    debtScore * 0.1;

  return {
    incomeScore,
    savingsScore,
    emergencyScore,
    passiveScore,
    runwayScore,
    debtScore,
    savingsRate,
    weightedScore,
    level: clamp(Math.round(weightedScore), 0, 100),
  };
}

export function financeMetricsFromCheckin(checkin: FinanceCheckin | null): Record<string, number> {
  if (!checkin) return {};
  const score = computeFinance(checkin);
  return {
    incomeScore: score.incomeScore,
    savingsScore: score.savingsScore,
    emergencyScore: score.emergencyScore,
    passiveScore: score.passiveScore,
    runwayScore: score.runwayScore,
    debtScore: score.debtScore,
  };
}

export function financeGateCriteria(
  targetRank: number,
  values: FinanceValues,
  score: FinanceScore,
): RankGateCriterion[] {
  const criteria: RankGateCriterion[] = [
    {
      key: `finance-r${targetRank}-score`,
      type: 'overall',
      title: `Finance score ${targetRank * 10}+`,
      description: 'Reach the weighted finance score required for the next rank.',
      minScore: targetRank * 10,
      met: score.weightedScore >= targetRank * 10,
    },
  ];

  const add = (
    key: string,
    title: string,
    description: string,
    met: boolean,
    type: 'metric' = 'metric',
  ) => {
    criteria.push({
      key: `finance-r${targetRank}-${key}`,
      type,
      title,
      description,
      met,
    });
  };

  if (targetRank === 1) {
    add('income', 'Income covers expenses', 'Income must at least match monthly expenses.', score.incomeScore >= 75);
    add('tracking', 'One month tracked', 'Complete a monthly finance check-in.', true);
  } else if (targetRank === 2) {
    add('income', 'Income ≥ 90% of expenses', 'A stable income covers nearly all essentials.', score.incomeScore >= 90);
    add('savings', 'Savings rate above 5%', 'Start keeping a small surplus each month.', values.income > 0 && score.savingsRate >= 0.05);
  } else if (targetRank === 3) {
    add('emergency', '3-month emergency fund', 'Set aside three months of expenses.', values.emergencyMonths >= 3);
    add('debt', 'Debt under control', 'Keep debt-to-income below 35%.', values.debtToIncome <= 0.35);
  } else if (targetRank === 4) {
    add('savings', 'Savings rate of 20%+', 'Save at least 20% of monthly income.', score.savingsRate >= 0.2);
    add('emergency', '3+ months of reserves', 'Maintain a meaningful emergency buffer.', values.emergencyMonths >= 3);
  } else if (targetRank === 5) {
    add('emergency', '6-month runway', 'Hold six months of expenses in reserve.', values.emergencyMonths >= 6);
    add('passive', 'Passive income started', 'Build at least one source of income that is not tied to hours.', values.passiveIncome > 0);
  } else if (targetRank === 6) {
    add('passive', 'Passive income covers 25%', 'Passive income covers a quarter of monthly expenses.', score.passiveScore >= 25);
  } else if (targetRank === 7) {
    add('passive', 'Passive income covers 50%', 'Passive income covers half of monthly expenses.', score.passiveScore >= 50);
  } else if (targetRank === 8) {
    add('passive', 'Passive income covers essentials', 'Baseline expenses are fully covered by passive income.', score.passiveScore >= 100);
  } else if (targetRank >= 9) {
    add('runway', '25+ year runway', 'Assets can sustain your lifestyle for 25+ years.', values.runwayYears >= 25);
  }

  return criteria;
}

export function getFinanceGate(
  skill: SkillState,
  checkin: FinanceCheckin | null,
): RankGate | null {
  if (!checkin || skill.type !== 'continuous') return null;
  const currentRank = rankIndexForLevel(skill.level);
  if (currentRank >= 9) return null;
  const targetRank = currentRank + 1;
  const targetLevel = targetRank * 10;
  const score = computeFinance(checkin);
  const criteria = financeGateCriteria(targetRank, checkin, score);
  return {
    skillId: skill.id,
    currentRank,
    targetRank,
    targetLevel,
    targetRankName: `${FINANCE_LADDER[targetRank].rank} ${toRoman(targetRank + 1)}`,
    criteria,
    demoKey: '',
    demoTitle: 'Monthly check-in',
    allMet: criteria.every((criterion) => criterion.met),
  };
}

export function financeLevelWithGate(
  previousLevel: number,
  rawScore: number,
  previousCheckins: number,
  values: FinanceValues,
): { level: number; gate: RankGate | null; held: boolean } {
  if (previousCheckins === 0) {
    return { level: rawScore, gate: null, held: false };
  }
  const previousRank = rankIndexForLevel(previousLevel);
  const ceiling = levelCeilingForRank(previousRank);
  if (rawScore <= ceiling) {
    return { level: rawScore, gate: null, held: false };
  }
  const pseudoSkill: SkillState = {
    id: 'finance',
    name: 'Finance',
    category: 'Life',
    type: 'continuous',
    description: '',
    icon: 'wallet',
    accent: '#5eead4',
    metrics: [],
    keyMetrics: [],
    demoTitles: [],
    level: previousLevel,
    certifiedLevel: previousLevel,
    xp: 0,
    assessedAt: null,
    scores: null,
  };
  const score = computeFinance(values);
  const criteria = financeGateCriteria(previousRank + 1, values, score);
  const gate: RankGate = {
    skillId: 'finance',
    currentRank: previousRank,
    targetRank: previousRank + 1,
    targetLevel: (previousRank + 1) * 10,
    targetRankName: `${FINANCE_LADDER[previousRank + 1].rank} ${toRoman(previousRank + 2)}`,
    criteria,
    demoKey: '',
    demoTitle: 'Monthly check-in',
    allMet: criteria.every((criterion) => criterion.met),
  };
  if (gate.allMet) {
    return {
      level: Math.min(rawScore, levelCeilingForRank(previousRank + 1)),
      gate,
      held: false,
    };
  }
  return { level: ceiling, gate, held: true };
}
