import { BADGES, evaluateBadges } from '../data/badges';
import { CURATED_QUEST_BY_ID, STARTER_SIDE_QUESTS } from '../data/quests';
import { createSkillStates, SKILL_BY_ID } from '../data/skills';
import { computeFinance, financeMetricsFromCheckin } from '../logic/finance';
import { computeWeightedScore, mainQuestForSkill, rankLabelForLevel, rankIndexForLevel } from '../logic/progression';
import type {
  ActiveQuest,
  ActivityEvent,
  AppState,
  Assessment,
  DailyCheckin,
  FinanceCheckin,
  FinanceValues,
  QuestCompletion,
  QuestDef,
  SkillId,
  SkillState,
} from '../types';
import { dateKey, monthKey } from '../utils/date';

let idCounter = 0;

export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function activeFromQuest(quest: QuestDef, addedAt = new Date().toISOString()): ActiveQuest {
  return {
    id: makeId('active'),
    questId: quest.id,
    title: quest.title,
    description: quest.description,
    skillId: quest.skillId,
    kind: quest.kind,
    source: quest.source,
    difficulty: quest.difficulty,
    xp: quest.xp,
    targetCount: quest.targetCount,
    progress: 0,
    repeatable: quest.repeatable,
    metricKey: quest.metricKey,
    demoKey: quest.demoKey,
    secondarySkillIds: quest.secondarySkillIds,
    addedAt,
  };
}

export function createFreshState(name: string, currency = 'USD'): AppState {
  const now = new Date().toISOString();
  const skills = createSkillStates();
  const activeQuests = STARTER_SIDE_QUESTS.map((id) => {
    const quest = CURATED_QUEST_BY_ID[id];
    return quest ? activeFromQuest(quest, now) : null;
  }).filter((quest): quest is ActiveQuest => Boolean(quest));

  return {
    version: 1,
    profile: {
      name: name.trim() || 'Wanderer',
      title: 'The Unwritten',
      createdAt: now,
      onboarded: true,
      demo: false,
    },
    settings: {
      currency,
      hapticsEnabled: true,
      assessmentReminders: false,
    },
    skills,
    activeQuests,
    customQuests: [],
    completions: [],
    assessments: [],
    financeCheckins: [],
    dailyCheckins: [],
    earnedBadges: [],
    events: [
      {
        id: makeId('event'),
        type: 'system',
        title: 'Character created',
        detail: 'Your first skill is waiting to be assessed.',
        createdAt: now,
      },
    ],
    streak: { current: 0, longest: 0, lastActiveDate: null },
    metDemoKeys: [],
  };
}

const DEMO_SCORES: Partial<Record<SkillId, Record<string, number>>> = {
  guitar: { technique: 40, repertoire: 32, rhythm: 36, theory: 22, performance: 34 },
  harmonica: { technique: 28, tone: 24, repertoire: 22, improvisation: 26, performance: 26 },
  sketching: { lineForm: 38, perspective: 30, valueLight: 34, composition: 32, finishedWork: 36 },
  'three-d': { modeling: 24, materials: 20, lighting: 18, design: 22, pipeline: 26 },
  language: { listening: 30, speaking: 34, reading: 26, writing: 28, grammarVocab: 32 },
  dsa: { problemSolving: 36, implementation: 34, complexity: 28, dataStructures: 30, communication: 24 },
  bodybuilding: { strength: 44, hypertrophy: 40, technique: 42, programming: 34, consistency: 40 },
  'martial-arts': { technique: 36, sparring: 32, conditioning: 30, strategy: 34, discipline: 36 },
};

const DEMO_XP: Partial<Record<SkillId, number>> = {
  guitar: 68,
  harmonica: 40,
  sketching: 12,
  'three-d': 55,
  language: 30,
  dsa: 20,
  bodybuilding: 75,
  'martial-arts': 10,
};

function dateAt(daysAgo: number, hour = 18, minute = 30): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function localDateAt(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return dateKey(date);
}

function monthOffset(offset: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return monthKey(date);
}

const DEMO_FINANCE: Array<{ offset: number; values: FinanceValues; note: string }> = [
  {
    offset: -5,
    values: {
      income: 5000,
      expenses: 4500,
      netWorth: 12000,
      emergencyMonths: 1,
      passiveIncome: 0,
      runwayYears: 0.4,
      debtToIncome: 0.36,
    },
    note: 'First month of tracking. Essentials are covered, barely.',
  },
  {
    offset: -4,
    values: {
      income: 5200,
      expenses: 4400,
      netWorth: 16000,
      emergencyMonths: 1.5,
      passiveIncome: 0,
      runwayYears: 0.7,
      debtToIncome: 0.32,
    },
    note: 'Cut one recurring expense and automated a small transfer.',
  },
  {
    offset: -3,
    values: {
      income: 5600,
      expenses: 4300,
      netWorth: 23000,
      emergencyMonths: 2,
      passiveIncome: 100,
      runwayYears: 1.1,
      debtToIncome: 0.28,
    },
    note: 'Started a small royalty stream. Emergency fund growing.',
  },
  {
    offset: -2,
    values: {
      income: 6000,
      expenses: 4200,
      netWorth: 31000,
      emergencyMonths: 3,
      passiveIncome: 200,
      runwayYears: 1.5,
      debtToIncome: 0.24,
    },
    note: 'Three-month buffer reached. Debt is down again.',
  },
  {
    offset: -1,
    values: {
      income: 6200,
      expenses: 4250,
      netWorth: 38000,
      emergencyMonths: 3.8,
      passiveIncome: 280,
      runwayYears: 1.9,
      debtToIncome: 0.2,
    },
    note: 'Savings rate holding above 30%. Passive income is real.',
  },
  {
    offset: 0,
    values: {
      income: 6500,
      expenses: 4300,
      netWorth: 42000,
      emergencyMonths: 4.5,
      passiveIncome: 350,
      runwayYears: 2.2,
      debtToIncome: 0.18,
    },
    note: 'Steady month. Next target: six months of runway.',
  },
];

function demoFinanceCheckins(): FinanceCheckin[] {
  return DEMO_FINANCE.map((entry) => {
    const score = computeFinance(entry.values);
    return {
      id: makeId('finance'),
      month: monthOffset(entry.offset),
      ...entry.values,
      savingsRate: score.savingsRate,
      score: Math.round(score.weightedScore),
      level: score.level,
      note: entry.note,
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + entry.offset,
        2,
        19,
        0,
        0,
      ).toISOString(),
    };
  });
}

function demoDailyCheckins(): DailyCheckin[] {
  const sleepQuality = [7, 8, 6, 8, 7, 9, 7, 8, 6, 7, 8, 9];
  const nutrition = [6, 7, 6, 8, 7, 8, 6, 7, 8, 7, 8, 9];
  const mood = [7, 8, 6, 8, 8, 9, 7, 8, 7, 8, 9, 9];
  const energy = [6, 7, 6, 8, 7, 8, 7, 8, 6, 7, 8, 9];
  const hours = [6.5, 7.5, 6, 8, 7, 8.5, 7, 7.5, 6.5, 7, 8, 8.5];
  const notes = [
    'Slow start. A short session still counted.',
    'Good focus after a walk.',
    'Low energy. Kept the practice light.',
    'Strong session. Best take in weeks.',
    'Steady day. Metronome work felt clean.',
    'Long sleep made everything easier.',
    'Busy day, but the streak survived.',
    'Good training and a clean sketch.',
    'Short night. Protected recovery.',
    'Focused DSA session before lunch.',
    'One of those days where it clicked.',
    'Closed the week strong.',
  ];
  return sleepQuality.map((quality, index) => ({
    id: makeId('daily'),
    date: localDateAt(11 - index),
    sleepHours: hours[index],
    sleepQuality: quality,
    nutrition: nutrition[index],
    mood: mood[index],
    energy: energy[index],
    note: notes[index],
    createdAt: dateAt(11 - index, 7, 30),
  }));
}

function demoCompletions(): QuestCompletion[] {
  const questIds = [
    'side-guitar-scales',
    'side-dsa-problem',
    'side-bodybuilding-push',
    'side-sketch-gesture',
    'side-language-speaking',
    'side-guitar-rhythm',
    'side-bodybuilding-pull',
    'side-harmonica-breath',
    'side-3d-blockout',
    'side-martial-drill',
    'side-sketch-value',
    'side-dsa-review',
    'side-guitar-song',
    'side-language-listening',
    'side-3d-material',
    'side-martial-spar',
    'side-bodybuilding-mobility',
    'side-sketch-finish',
    'side-dsa-explain',
    'side-harmonica-lick',
    'side-guitar-ear',
    'side-3d-render',
    'side-martial-conditioning',
    'side-language-writing',
    'side-sketch-3d',
    'side-bodybuilding-push',
  ];
  const completions: QuestCompletion[] = [];
  questIds.forEach((questId, index) => {
    const quest = CURATED_QUEST_BY_ID[questId];
    if (!quest) return;
    const daysAgo = index < 14 ? Math.floor(index / 2) : 12 + (index - 14);
    const evidence =
      index === 3
        ? 'Posted the gesture sheet to my sketchbook.'
        : index === 12
          ? 'Recorded take 03. Clean except the last chord.'
          : undefined;
    completions.push({
      id: makeId('completion'),
      questId: quest.id,
      title: quest.title,
      skillId: quest.skillId,
      kind: quest.kind,
      xp: quest.xp,
      completedAt: dateAt(daysAgo, 17 + (index % 4), (index * 7) % 60),
      notes:
        index === 3
          ? 'Line confidence is improving when I start with the big shapes.'
          : index === 12
            ? 'Tempo slipped in the bridge. Slow it down next time.'
            : undefined,
      evidence,
      secondarySkillIds: quest.secondarySkillIds,
    });
  });
  return completions;
}

export function createDemoState(name: string, currency = 'USD'): AppState {
  const now = new Date().toISOString();
  const skills = createSkillStates();
  const assessments: Assessment[] = [];
  const events: ActivityEvent[] = [];

  for (const skill of skills) {
    if (skill.type === 'continuous') continue;
    const scores = DEMO_SCORES[skill.id];
    if (!scores) continue;
    const weighted = computeWeightedScore(skill.metrics, scores);
    const level = Math.round(weighted);
    const assessedAt = dateAt(24 + skills.findIndex((s) => s.id === skill.id) * 2, 20, 15);
    skill.scores = scores;
    skill.level = level;
    skill.certifiedLevel = level;
    skill.xp = DEMO_XP[skill.id] ?? 0;
    skill.assessedAt = assessedAt;
    const assessment: Assessment = {
      id: makeId('assessment'),
      skillId: skill.id,
      mode: 'initial',
      scores,
      weightedScore: weighted,
      previousLevel: 0,
      newLevel: level,
      previousRank: 0,
      newRank: rankIndexForLevel(level),
      passedGate: true,
      note: 'Baseline assessment for the demo character.',
      createdAt: assessedAt,
    };
    assessments.push(assessment);
    events.push({
      id: makeId('event'),
      type: 'assessment',
      title: `Assessed ${skill.name}`,
      detail: `Baseline ${level} · ${rankLabelForLevel(level, skill.id)}`,
      skillId: skill.id,
      createdAt: assessedAt,
    });
  }

  const financeCheckins = demoFinanceCheckins();
  const latestFinance = financeCheckins[financeCheckins.length - 1];
  const financeSkill = skills.find((skill) => skill.id === 'finance') as SkillState;
  const financeScore = computeFinance(latestFinance);
  financeSkill.level = financeScore.level;
  financeSkill.certifiedLevel = financeScore.level;
  financeSkill.scores = financeMetricsFromCheckin(latestFinance);
  financeSkill.assessedAt = latestFinance.createdAt;

  const guitar = skills.find((skill) => skill.id === 'guitar') as SkillState;
  const guitarMain = mainQuestForSkill(guitar);
  const activeQuests: ActiveQuest[] = [];
  if (guitarMain) {
    const active = activeFromQuest(guitarMain, dateAt(3, 9, 0));
    active.progress = 2;
    activeQuests.push(active);
  }
  for (const questId of STARTER_SIDE_QUESTS) {
    const quest = CURATED_QUEST_BY_ID[questId];
    if (quest) activeQuests.push(activeFromQuest(quest, dateAt(1, 8, 0)));
  }

  const customQuest: QuestDef = {
    id: 'custom-demo-hands',
    title: 'Sketch one page of hands',
    description: 'Fill a page with hand studies from observation.',
    skillId: 'sketching',
    kind: 'side',
    source: 'custom',
    difficulty: 'medium',
    xp: 20,
    targetCount: 1,
    repeatable: true,
    metricKey: 'lineForm',
  };

  const dailyCheckins = demoDailyCheckins();
  const completions = demoCompletions();
  const metDemoKeys: string[] = [];

  const state: AppState = {
    version: 1,
    profile: {
      name: name.trim() || 'Pranav',
      title: 'The Polymath',
      createdAt: dateAt(120, 9, 0),
      onboarded: true,
      demo: true,
    },
    settings: {
      currency,
      hapticsEnabled: true,
      assessmentReminders: false,
    },
    skills,
    activeQuests,
    customQuests: [customQuest],
    completions,
    assessments,
    financeCheckins,
    dailyCheckins,
    earnedBadges: [],
    events,
    streak: {
      current: 12,
      longest: 18,
      lastActiveDate: localDateAt(0),
    },
    metDemoKeys,
  };

  for (const checkin of financeCheckins) {
    events.push({
      id: makeId('event'),
      type: 'finance',
      title: 'Monthly finance check-in',
      detail: `Score ${checkin.score} · ${rankLabelForLevel(checkin.level, 'finance')}`,
      skillId: 'finance',
      createdAt: checkin.createdAt,
    });
  }

  for (const completion of completions.slice(0, 16)) {
    events.push({
      id: makeId('event'),
      type: 'quest',
      title: completion.title,
      detail: `${SKILL_BY_ID[completion.skillId].name} · ${completion.xp > 0 ? `+${completion.xp} XP` : 'Milestone logged'}`,
      xp: completion.xp || undefined,
      skillId: completion.skillId,
      createdAt: completion.completedAt,
    });
  }

  for (const checkin of dailyCheckins.slice(-4)) {
    events.push({
      id: makeId('event'),
      type: 'checkin',
      title: 'Daily check-in',
      detail: `${checkin.sleepHours}h sleep · Nutrition ${checkin.nutrition}/10 · Mood ${checkin.mood}/10`,
      createdAt: checkin.createdAt,
    });
  }

  const earned = evaluateBadges(state, dateAt(1, 21, 0));
  state.earnedBadges = earned;
  for (const badge of earned) {
    const definition = BADGES.find((item) => item.id === badge.id);
    if (!definition) continue;
    state.events.push({
      id: makeId('event'),
      type: 'badge',
      title: `Badge earned: ${definition.name}`,
      detail: definition.description,
      createdAt: badge.earnedAt,
    });
  }

  state.events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  state.events = state.events.slice(0, 100);
  state.activeQuests = activeQuests;
  return state;
}

export function cloneState(state: AppState): AppState {
  return JSON.parse(JSON.stringify(state)) as AppState;
}

export function addEvent(
  state: AppState,
  event: Omit<ActivityEvent, 'id' | 'createdAt'> & { createdAt?: string },
): void {
  state.events.unshift({
    ...event,
    id: makeId('event'),
    createdAt: event.createdAt ?? new Date().toISOString(),
  });
  state.events = state.events.slice(0, 150);
}

export function sortEvents(state: AppState): void {
  state.events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
