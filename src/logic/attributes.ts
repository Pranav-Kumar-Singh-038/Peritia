import type { AppState, AttributeKey, AttributeScore, DerivedCharacter, SkillId } from '../types';
import { addDays, monthKey, todayKey } from '../utils/date';
import { clamp } from '../utils/format';
import { rankLabelForLevel, rankIndexForLevel, skillLevel } from './progression';

const ATTRIBUTE_META: Array<{ key: AttributeKey; label: string; short: string }> = [
  { key: 'strength', label: 'Strength', short: 'STR' },
  { key: 'endurance', label: 'Endurance', short: 'END' },
  { key: 'agility', label: 'Agility', short: 'AGI' },
  { key: 'dexterity', label: 'Dexterity', short: 'DEX' },
  { key: 'focus', label: 'Focus', short: 'FOC' },
  { key: 'discipline', label: 'Discipline', short: 'DIS' },
  { key: 'creativity', label: 'Creativity', short: 'CRE' },
  { key: 'vitality', label: 'Vitality', short: 'VIT' },
];

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function levelOf(state: AppState, id: SkillId): number {
  return skillLevel(state, id);
}

export function deriveAttributes(state: AppState): AttributeScore[] {
  const bodybuilding = levelOf(state, 'bodybuilding');
  const martial = levelOf(state, 'martial-arts');
  const guitar = levelOf(state, 'guitar');
  const harmonica = levelOf(state, 'harmonica');
  const sketching = levelOf(state, 'sketching');
  const threeD = levelOf(state, 'three-d');
  const language = levelOf(state, 'language');
  const dsa = levelOf(state, 'dsa');

  const today = todayKey();
  const cutoff = addDays(today, -30);
  const questsLast30 = state.completions.filter(
    (completion) => completion.completedAt.slice(0, 10) >= cutoff,
  ).length;
  const questScore = clamp((questsLast30 / 20) * 100, 0, 100);
  const streakScore = clamp((state.streak.current / 30) * 100, 0, 100);

  const recentCheckins = state.dailyCheckins.filter((checkin) => checkin.date >= addDays(today, -14));
  const sleepScore = clamp(average(recentCheckins.map((checkin) => checkin.sleepQuality)) * 10, 0, 100);
  const nutritionScore = clamp(average(recentCheckins.map((checkin) => checkin.nutrition)) * 10, 0, 100);

  const currentMonth = monthKey();
  const sixMonthsAgo = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    return monthKey(d);
  })();
  const financeMonths = new Set(
    state.financeCheckins
      .filter((checkin) => checkin.month >= sixMonthsAgo && checkin.month <= currentMonth)
      .map((checkin) => checkin.month),
  ).size;
  const financeScore = clamp((financeMonths / 6) * 100, 0, 100);

  const discipline =
    questScore * 0.35 +
    streakScore * 0.2 +
    sleepScore * 0.15 +
    nutritionScore * 0.15 +
    financeScore * 0.15;

  const values: Record<AttributeKey, number> = {
    strength: bodybuilding * 0.6 + martial * 0.4,
    endurance: bodybuilding * 0.5 + martial * 0.5,
    agility: martial * 0.8 + bodybuilding * 0.2,
    dexterity: guitar * 0.35 + harmonica * 0.25 + sketching * 0.25 + threeD * 0.15,
    focus: dsa * 0.4 + language * 0.3 + threeD * 0.15 + guitar * 0.15,
    discipline,
    creativity: sketching * 0.3 + threeD * 0.3 + guitar * 0.25 + harmonica * 0.15,
    vitality: sleepScore * 0.4 + nutritionScore * 0.3 + bodybuilding * 0.2 + martial * 0.1,
  };

  return ATTRIBUTE_META.map((meta) => ({
    ...meta,
    value: Math.round(clamp(values[meta.key], 0, 100)),
  }));
}

function characterTitle(state: AppState, attributes: AttributeScore[]): string {
  const assessed = state.skills.filter((skill) => skill.assessedAt || skill.level > 0);
  if (!assessed.length) return 'The Unwritten';
  const minLevel = Math.min(...assessed.map((skill) => skill.level));
  if (assessed.length >= 7 && minLevel >= 15) return 'The Polymath';

  const value = (key: AttributeKey) => attributes.find((a) => a.key === key)?.value ?? 0;
  const physical = (value('strength') + value('endurance') + value('agility')) / 3;
  const creative = value('creativity');
  const knowledge = value('focus');
  const finance = state.skills.find((skill) => skill.id === 'finance')?.level ?? 0;
  const topSkill = Math.max(...state.skills.map((skill) => skill.level));

  if (finance >= topSkill && finance > 0) return 'The Steward';
  if (physical > creative && physical > knowledge) return 'The Vanguard';
  if (creative > knowledge) return 'The Artisan';
  if (knowledge > 0) return 'The Scholar';
  return 'The Seeker';
}

export function deriveCharacter(state: AppState): DerivedCharacter {
  const attributes = deriveAttributes(state);
  const levels = state.skills.map((skill) => skill.level);
  const level = levels.length ? Math.round(average(levels)) : 0;
  const totalXp = state.completions.reduce((sum, completion) => sum + completion.xp, 0);
  const assessedSkills = state.skills.filter(
    (skill) => skill.assessedAt !== null || (skill.id === 'finance' && skill.level > 0),
  ).length;

  return {
    level,
    rank: rankIndexForLevel(level),
    rankLabel: rankLabelForLevel(level),
    title: characterTitle(state, attributes),
    totalXp,
    attributes,
    assessedSkills,
  };
}

export function attributeValue(state: AppState, key: AttributeKey): number {
  return deriveAttributes(state).find((attribute) => attribute.key === key)?.value ?? 0;
}
