import type { AppState, BadgeDef, EarnedBadge } from '../types';
import { deriveAttributes } from '../logic/attributes';

export const BADGES: BadgeDef[] = [
  {
    id: 'first-quest',
    name: 'First Steps',
    description: 'Complete your first quest.',
    hint: 'Complete any side quest.',
    icon: 'footprints',
    tier: 'bronze',
  },
  {
    id: 'first-assessment',
    name: 'Self-Aware',
    description: 'Complete your first metric assessment.',
    hint: 'Assess any skill.',
    icon: 'scan',
    tier: 'bronze',
  },
  {
    id: 'first-rank-up',
    name: 'Ascendant',
    description: 'Cross your first rank gate.',
    hint: 'Pass a rank trial.',
    icon: 'arrow-up',
    tier: 'gold',
  },
  {
    id: 'first-custom',
    name: 'Personal Code',
    description: 'Create a custom quest.',
    hint: 'Forge a quest of your own.',
    icon: 'scroll',
    tier: 'bronze',
  },
  {
    id: 'first-evidence',
    name: 'Receipts',
    description: 'Attach evidence to a completed quest.',
    hint: 'Add a proof note or link.',
    icon: 'paperclip',
    tier: 'bronze',
  },
  {
    id: 'streak-7',
    name: 'Sevenfold',
    description: 'Maintain a 7-day streak.',
    hint: 'Show up seven days in a row.',
    icon: 'flame',
    tier: 'bronze',
  },
  {
    id: 'streak-30',
    name: 'Unbroken',
    description: 'Maintain a 30-day streak.',
    hint: 'Show up thirty days in a row.',
    icon: 'flame',
    tier: 'silver',
  },
  {
    id: 'streak-100',
    name: 'Century',
    description: 'Maintain a 100-day streak.',
    hint: 'Show up one hundred days in a row.',
    icon: 'flame',
    tier: 'gold',
  },
  {
    id: 'skill-20',
    name: "Apprentice's Mark",
    description: 'Raise any skill to level 20.',
    hint: 'Reach Adept in one skill.',
    icon: 'star',
    tier: 'bronze',
  },
  {
    id: 'skill-40',
    name: 'Proficient',
    description: 'Raise any skill to level 40.',
    hint: 'Reach Proficient in one skill.',
    icon: 'medal',
    tier: 'silver',
  },
  {
    id: 'skill-60',
    name: "Expert's Seal",
    description: 'Raise any skill to level 60.',
    hint: 'Reach Expert in one skill.',
    icon: 'gem',
    tier: 'gold',
  },
  {
    id: 'all-rounder',
    name: 'All-Rounder',
    description: 'Raise three skills to level 20.',
    hint: 'Build breadth across three skills.',
    icon: 'layers',
    tier: 'silver',
  },
  {
    id: 'polymath',
    name: 'Polymath',
    description: 'Raise five skills to level 40.',
    hint: 'Build depth across five skills.',
    icon: 'crown',
    tier: 'gold',
  },
  {
    id: 'balanced',
    name: 'Balance',
    description: 'Bring every attribute to 40+.',
    hint: 'Round out your whole character.',
    icon: 'shield',
    tier: 'gold',
  },
  {
    id: 'quests-25',
    name: 'Momentum',
    description: 'Complete 25 quests.',
    hint: 'Keep stacking completed sessions.',
    icon: 'target',
    tier: 'silver',
  },
  {
    id: 'total-xp-1000',
    name: 'Thousand Cuts',
    description: 'Earn 1,000 total quest XP.',
    hint: 'Practice adds up.',
    icon: 'sparkles',
    tier: 'silver',
  },
  {
    id: 'finance-first',
    name: 'Ledger Opened',
    description: 'Complete your first monthly finance check-in.',
    hint: 'Record one month of finances.',
    icon: 'wallet',
    tier: 'bronze',
  },
  {
    id: 'finance-buffer',
    name: 'Safe Harbor',
    description: 'Build a three-month emergency fund.',
    hint: 'Reach three months of reserves.',
    icon: 'anchor',
    tier: 'silver',
  },
  {
    id: 'finance-runway',
    name: 'Long Runway',
    description: 'Build a six-month emergency runway.',
    hint: 'Reach six months of reserves.',
    icon: 'plane',
    tier: 'silver',
  },
  {
    id: 'finance-independence',
    name: 'Optionality',
    description: 'Reach Independence or Abundance in Finance.',
    hint: 'Let passive income cover your baseline.',
    icon: 'sun',
    tier: 'gold',
  },
  {
    id: 'assessments-8',
    name: 'Cartographer',
    description: 'Assess every skill on the roster.',
    hint: 'Map your whole character.',
    icon: 'map',
    tier: 'gold',
  },
  {
    id: 'rank-ups-3',
    name: 'Gatecrasher',
    description: 'Cross three rank gates.',
    hint: 'Earn three promotions.',
    icon: 'key',
    tier: 'gold',
  },
];

export const BADGE_BY_ID = Object.fromEntries(BADGES.map((badge) => [badge.id, badge])) as Record<
  string,
  BadgeDef
>;

export function badgeIsEarned(state: AppState, id: string): boolean {
  return state.earnedBadges.some((badge) => badge.id === id);
}

function latestFinance(state: AppState) {
  return [...state.financeCheckins].sort((a, b) => b.month.localeCompare(a.month))[0] ?? null;
}

export function shouldEarnBadge(state: AppState, badge: BadgeDef): boolean {
  const skills = state.skills;
  const completed = state.completions.length;
  const rankUps = state.assessments.filter((assessment) => assessment.newRank > assessment.previousRank).length;
  const latest = latestFinance(state);
  const assessed = skills.filter((skill) => skill.assessedAt !== null).length;

  switch (badge.id) {
    case 'first-quest':
      return completed >= 1;
    case 'first-assessment':
      return state.assessments.length >= 1;
    case 'first-rank-up':
      return rankUps >= 1;
    case 'first-custom':
      return state.customQuests.length >= 1;
    case 'first-evidence':
      return state.completions.some((completion) => Boolean(completion.evidence));
    case 'streak-7':
      return state.streak.current >= 7 || state.streak.longest >= 7;
    case 'streak-30':
      return state.streak.current >= 30 || state.streak.longest >= 30;
    case 'streak-100':
      return state.streak.current >= 100 || state.streak.longest >= 100;
    case 'skill-20':
      return skills.some((skill) => skill.level >= 20);
    case 'skill-40':
      return skills.some((skill) => skill.level >= 40);
    case 'skill-60':
      return skills.some((skill) => skill.level >= 60);
    case 'all-rounder':
      return skills.filter((skill) => skill.level >= 20).length >= 3;
    case 'polymath':
      return skills.filter((skill) => skill.level >= 40).length >= 5;
    case 'balanced':
      return deriveAttributes(state).every((attribute) => attribute.value >= 40);
    case 'quests-25':
      return completed >= 25;
    case 'total-xp-1000':
      return state.completions.reduce((sum, completion) => sum + completion.xp, 0) >= 1000;
    case 'finance-first':
      return state.financeCheckins.length >= 1;
    case 'finance-buffer':
      return Boolean(latest && latest.emergencyMonths >= 3);
    case 'finance-runway':
      return Boolean(latest && latest.emergencyMonths >= 6);
    case 'finance-independence':
      return (skills.find((skill) => skill.id === 'finance')?.level ?? 0) >= 80;
    case 'assessments-8':
      return assessed >= 8;
    case 'rank-ups-3':
      return rankUps >= 3;
    default:
      return false;
  }
}

export function evaluateBadges(state: AppState, now = new Date().toISOString()): EarnedBadge[] {
  const existing = new Set(state.earnedBadges.map((badge) => badge.id));
  const earned: EarnedBadge[] = [];
  for (const badge of BADGES) {
    if (existing.has(badge.id)) continue;
    if (shouldEarnBadge(state, badge)) {
      earned.push({ id: badge.id, earnedAt: now });
      existing.add(badge.id);
    }
  }
  return earned;
}

export function nextLockedBadges(state: AppState, limit = 3): BadgeDef[] {
  const earned = new Set(state.earnedBadges.map((badge) => badge.id));
  return BADGES.filter((badge) => !earned.has(badge.id)).slice(0, limit);
}
