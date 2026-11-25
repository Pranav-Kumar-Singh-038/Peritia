export type SkillId =
  | 'guitar'
  | 'harmonica'
  | 'sketching'
  | 'three-d'
  | 'language'
  | 'dsa'
  | 'bodybuilding'
  | 'martial-arts'
  | 'finance';

export type SkillType = 'assessed' | 'continuous';

export type SkillCategory = 'Music' | 'Creative' | 'Knowledge' | 'Physical' | 'Life';

export type AttributeKey =
  | 'strength'
  | 'endurance'
  | 'agility'
  | 'dexterity'
  | 'focus'
  | 'discipline'
  | 'creativity'
  | 'vitality';

export type QuestKind = 'main' | 'side';
export type QuestSource = 'curated' | 'custom';
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type AssessmentMode = 'initial' | 'reassessment' | 'rank-trial';
export type ToastTone = 'default' | 'success' | 'gold' | 'danger';
export type ActivityType =
  | 'quest'
  | 'assessment'
  | 'rank-up'
  | 'finance'
  | 'checkin'
  | 'badge'
  | 'system';

export interface MetricDef {
  key: string;
  label: string;
  short: string;
  weight: number;
  description: string;
  rubric: {
    low: string;
    mid: string;
    high: string;
  };
}

export interface SkillState {
  id: SkillId;
  name: string;
  category: SkillCategory;
  type: SkillType;
  description: string;
  icon: string;
  accent: string;
  metrics: MetricDef[];
  keyMetrics: string[];
  demoTitles: string[];
  level: number;
  certifiedLevel: number;
  xp: number;
  assessedAt: string | null;
  scores: Record<string, number> | null;
}

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  skillId: SkillId;
  kind: QuestKind;
  source: QuestSource;
  difficulty: QuestDifficulty;
  xp: number;
  targetCount: number;
  repeatable: boolean;
  metricKey?: string;
  demoKey?: string;
  secondarySkillIds?: SkillId[];
}

export interface ActiveQuest {
  id: string;
  questId: string;
  title: string;
  description: string;
  skillId: SkillId;
  kind: QuestKind;
  source: QuestSource;
  difficulty: QuestDifficulty;
  xp: number;
  targetCount: number;
  progress: number;
  repeatable: boolean;
  metricKey?: string;
  demoKey?: string;
  secondarySkillIds?: SkillId[];
  addedAt: string;
}

export interface QuestCompletion {
  id: string;
  questId: string;
  title: string;
  skillId: SkillId;
  kind: QuestKind;
  xp: number;
  completedAt: string;
  notes?: string;
  evidence?: string;
  demoKey?: string;
  secondarySkillIds?: SkillId[];
}

export interface Assessment {
  id: string;
  skillId: SkillId;
  mode: AssessmentMode;
  scores: Record<string, number>;
  weightedScore: number;
  previousLevel: number;
  newLevel: number;
  previousRank: number;
  newRank: number;
  passedGate: boolean;
  gateNotes?: string;
  note?: string;
  createdAt: string;
}

export interface FinanceValues {
  income: number;
  expenses: number;
  netWorth: number;
  emergencyMonths: number;
  passiveIncome: number;
  runwayYears: number;
  debtToIncome: number;
}

export interface FinanceCheckin extends FinanceValues {
  id: string;
  month: string;
  savingsRate: number;
  score: number;
  level: number;
  note?: string;
  createdAt: string;
}

export interface DailyCheckin {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  nutrition: number;
  mood: number;
  energy: number;
  note?: string;
  createdAt: string;
}

export interface EarnedBadge {
  id: string;
  earnedAt: string;
  skillId?: SkillId;
}

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  xp?: number;
  skillId?: SkillId;
  createdAt: string;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDate: string | null;
}

export interface AppSettings {
  currency: string;
  hapticsEnabled: boolean;
  assessmentReminders: boolean;
}

export interface Profile {
  name: string;
  title: string;
  createdAt: string;
  onboarded: boolean;
  demo: boolean;
}

export interface AppState {
  version: 1;
  profile: Profile;
  settings: AppSettings;
  skills: SkillState[];
  activeQuests: ActiveQuest[];
  customQuests: QuestDef[];
  completions: QuestCompletion[];
  assessments: Assessment[];
  financeCheckins: FinanceCheckin[];
  dailyCheckins: DailyCheckin[];
  earnedBadges: EarnedBadge[];
  events: ActivityEvent[];
  streak: StreakState;
  metDemoKeys: string[];
}

export interface RankGateCriterion {
  key: string;
  type: 'overall' | 'metric' | 'demonstration';
  title: string;
  description: string;
  metricKey?: string;
  minScore?: number;
  demoKey?: string;
  met: boolean;
}

export interface RankGate {
  skillId: SkillId;
  currentRank: number;
  targetRank: number;
  targetLevel: number;
  targetRankName: string;
  criteria: RankGateCriterion[];
  demoKey: string;
  demoTitle: string;
  allMet: boolean;
}

export interface AttributeScore {
  key: AttributeKey;
  label: string;
  short: string;
  value: number;
}

export interface DerivedCharacter {
  level: number;
  rank: number;
  rankLabel: string;
  title: string;
  totalXp: number;
  attributes: AttributeScore[];
  assessedSkills: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  hint: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'special';
}
