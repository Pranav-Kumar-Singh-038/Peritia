import * as Haptics from 'expo-haptics';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { BADGE_BY_ID, evaluateBadges } from '../data/badges';
import { CURATED_QUEST_BY_ID, questDifficultyXp } from '../data/quests';
import { computeFinance, financeLevelWithGate, financeMetricsFromCheckin } from '../logic/finance';
import {
  applyPracticeXp,
  getRankGate,
  rankIndexForLevel,
  rankLabelForLevel,
  resolveAssessment,
  secondaryXp,
  type AssessmentResolution,
} from '../logic/progression';
import type {
  AppSettings,
  AppState,
  DailyCheckin,
  FinanceCheckin,
  FinanceValues,
  QuestCompletion,
  QuestDef,
  QuestDifficulty,
  SkillId,
  ToastTone,
} from '../types';
import { daysBetween, dateKey, monthKey } from '../utils/date';
import {
  addEvent,
  activeFromQuest,
  cloneState,
  createDemoState,
  createFreshState,
  makeId,
  sortEvents,
} from './factory';
import { clearState, loadState, saveState } from './storage';

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface CustomQuestInput {
  title: string;
  description: string;
  skillId: SkillId;
  difficulty: QuestDifficulty;
  repeatable: boolean;
  secondarySkillId?: SkillId | null;
  metricKey?: string;
}

export interface QuestActionResult {
  completed: boolean;
  xp: number;
  levelsGained: number;
  skillName: string;
  newLevel: number;
  rankTrialReady: boolean;
  progress?: number;
  targetCount?: number;
}

export interface FinanceResult {
  checkin: FinanceCheckin;
  held: boolean;
  level: number;
  rawScore: number;
  rankUp: boolean;
  rankLabel: string;
  unmet: string[];
}

export interface AssessmentResult extends AssessmentResolution {
  rankUp: boolean;
  skillName: string;
  rankLabel: string;
}

interface AppContextValue {
  state: AppState | null;
  ready: boolean;
  toast: ToastMessage | null;
  dismissToast: () => void;
  createProfile: (name: string, mode: 'fresh' | 'demo', currency: string) => void;
  renameProfile: (name: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  assessSkill: (
    skillId: SkillId,
    scores: Record<string, number>,
    mode: 'initial' | 'reassessment' | 'rank-trial',
    note?: string,
  ) => AssessmentResult | null;
  completeQuest: (activeId: string, notes?: string, evidence?: string) => QuestActionResult | null;
  startMainQuest: (quest: QuestDef) => void;
  addSideQuest: (quest: QuestDef) => boolean;
  removeActiveQuest: (activeId: string) => void;
  createCustomQuest: (input: CustomQuestInput) => QuestDef | null;
  saveFinanceCheckin: (values: FinanceValues, note?: string) => FinanceResult | null;
  saveDailyCheckin: (
    input: Omit<DailyCheckin, 'id' | 'date' | 'createdAt'>,
  ) => void;
  importState: (json: string) => { ok: boolean; error?: string };
  eraseAllData: () => Promise<void>;
  loadDemoProfile: () => void;
  showToast: (message: string, tone?: ToastTone) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function registerActivity(state: AppState, iso = new Date().toISOString()): void {
  const day = dateKey(new Date(iso));
  const last = state.streak.lastActiveDate;
  if (last === day) return;
  if (last) {
    const gap = daysBetween(last, day);
    if (gap === 1) {
      state.streak.current += 1;
    } else if (gap > 1) {
      state.streak.current = 1;
    } else {
      return;
    }
  } else {
    state.streak.current = 1;
  }
  state.streak.longest = Math.max(state.streak.longest, state.streak.current);
  state.streak.lastActiveDate = day;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAppState(value: unknown): value is AppState {
  if (!isRecord(value)) return false;
  return (
    value.version === 1 &&
    isRecord(value.profile) &&
    typeof value.profile.name === 'string' &&
    isRecord(value.settings) &&
    Array.isArray(value.skills) &&
    value.skills.length > 0 &&
    Array.isArray(value.activeQuests) &&
    Array.isArray(value.customQuests) &&
    Array.isArray(value.completions) &&
    Array.isArray(value.assessments) &&
    Array.isArray(value.financeCheckins) &&
    Array.isArray(value.dailyCheckins) &&
    Array.isArray(value.earnedBadges) &&
    Array.isArray(value.events) &&
    isRecord(value.streak)
  );
}

function normalizeImported(parsed: AppState): AppState {
  const base = createFreshState(parsed.profile?.name ?? 'Wanderer', parsed.settings?.currency ?? 'USD');
  return {
    ...base,
    ...parsed,
    version: 1,
    settings: { ...base.settings, ...parsed.settings },
    skills: parsed.skills.length ? parsed.skills : base.skills,
    activeQuests: parsed.activeQuests ?? [],
    customQuests: parsed.customQuests ?? [],
    completions: parsed.completions ?? [],
    assessments: parsed.assessments ?? [],
    financeCheckins: parsed.financeCheckins ?? [],
    dailyCheckins: parsed.dailyCheckins ?? [],
    earnedBadges: parsed.earnedBadges ?? [],
    events: parsed.events ?? [],
    metDemoKeys: parsed.metDemoKeys ?? [],
    streak: parsed.streak ?? base.streak,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = 'default') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, tone });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadState()
      .then((loaded) => {
        if (cancelled) return;
        if (loaded && isAppState(loaded)) {
          setState(loaded);
        } else if (loaded) {
          showToast('Saved data could not be read. Starting fresh.', 'danger');
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setReady(true);
          showToast('Local database unavailable. Changes may not persist.', 'danger');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  useEffect(() => {
    if (!ready || !state) return;
    const timer = setTimeout(() => {
      saveState(state).catch(() => {
        showToast('Could not save your progress.', 'danger');
      });
    }, 240);
    return () => clearTimeout(timer);
  }, [state, ready, showToast]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const haptic = useCallback(
    (kind: 'light' | 'success' | 'warning' = 'light') => {
      if (!state?.settings.hapticsEnabled) return;
      if (kind === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else if (kind === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [state?.settings.hapticsEnabled],
  );

  const finalize = useCallback(
    (draft: AppState, message: string, tone: ToastTone = 'default') => {
      const earned = evaluateBadges(draft);
      if (earned.length) {
        draft.earnedBadges.push(...earned);
        for (const badge of earned) {
          const definition = BADGE_BY_ID[badge.id];
          if (!definition) continue;
          addEvent(draft, {
            type: 'badge',
            title: `Badge earned: ${definition.name}`,
            detail: definition.description,
            createdAt: badge.earnedAt,
          });
        }
        haptic('success');
      }
      sortEvents(draft);
      setState(draft);
      if (earned.length) {
        const label =
          earned.length === 1
            ? BADGE_BY_ID[earned[0].id]?.name ?? 'Badge earned'
            : `${earned.length} badges earned`;
        showToast(`${message} · ${label}`, 'gold');
      } else {
        showToast(message, tone);
      }
    },
    [haptic, showToast],
  );

  const createProfile = useCallback(
    (name: string, mode: 'fresh' | 'demo', currency: string) => {
      const next =
        mode === 'demo' ? createDemoState(name, currency) : createFreshState(name, currency);
      setState(next);
      setReady(true);
      showToast(
        mode === 'demo' ? 'Demo character loaded. Reset it any time in Settings.' : 'Character created.',
        mode === 'demo' ? 'gold' : 'success',
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    [showToast],
  );

  const renameProfile = useCallback(
    (name: string) => {
      if (!state) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      const draft = cloneState(state);
      draft.profile.name = trimmed;
      finalize(draft, 'Name updated.');
    },
    [state, finalize],
  );

  const updateSettings = useCallback(
    (settings: Partial<AppSettings>) => {
      if (!state) return;
      const draft = cloneState(state);
      draft.settings = { ...draft.settings, ...settings };
      finalize(draft, 'Settings updated.');
      if (settings.hapticsEnabled !== false) haptic('light');
    },
    [state, finalize, haptic],
  );

  const assessSkill = useCallback(
    (
      skillId: SkillId,
      scores: Record<string, number>,
      mode: 'initial' | 'reassessment' | 'rank-trial',
      note?: string,
    ): AssessmentResult | null => {
      if (!state) return null;
      const skill = state.skills.find((item) => item.id === skillId);
      if (!skill) return null;
      const now = new Date().toISOString();
      const resolution = resolveAssessment(skill, scores, mode, state.metDemoKeys);
      const previousRank = rankIndexForLevel(skill.level);
      const previousLabel = rankLabelForLevel(skill.level, skill.id);
      const draft = cloneState(state);
      const target = draft.skills.find((item) => item.id === skillId);
      if (!target) return null;

      target.scores = { ...scores };
      target.level = resolution.newLevel;
      target.assessedAt = now;
      target.xp = 0;
      if (resolution.passedGate) {
        target.certifiedLevel = resolution.newLevel;
      }

      draft.assessments.unshift({
        id: makeId('assessment'),
        skillId,
        mode,
        scores: { ...scores },
        weightedScore: resolution.weightedScore,
        previousLevel: skill.level,
        newLevel: resolution.newLevel,
        previousRank,
        newRank: resolution.newRank,
        passedGate: resolution.passedGate,
        gateNotes: resolution.gateNotes,
        note,
        createdAt: now,
      });

      registerActivity(draft, now);
      const rankUp = resolution.newRank > previousRank;
      const newLabel = rankLabelForLevel(resolution.newLevel, skill.id);

      if (rankUp) {
        addEvent(draft, {
          type: 'rank-up',
          title: `Rank up: ${skill.name}`,
          detail: `${previousLabel} → ${newLabel}`,
          skillId,
          createdAt: now,
        });
      } else if (!resolution.passedGate) {
        addEvent(draft, {
          type: 'assessment',
          title: `Rank trial held: ${skill.name}`,
          detail: resolution.gateNotes ?? 'Rank gate not met.',
          skillId,
          createdAt: now,
        });
      } else {
        addEvent(draft, {
          type: 'assessment',
          title: `Assessed ${skill.name}`,
          detail: `${resolution.newLevel} · ${newLabel}`,
          skillId,
          createdAt: now,
        });
      }

      let message: string;
      if (rankUp) {
        message = `Rank up! ${skill.name} — ${newLabel}`;
        haptic('success');
      } else if (!resolution.passedGate) {
        message = `Rank gate held · ${skill.name}`;
        haptic('warning');
      } else if (mode === 'initial') {
        message = `Baseline set · ${skill.name} ${resolution.newLevel}`;
        haptic('success');
      } else {
        message = `Assessment saved · ${skill.name} ${resolution.newLevel}`;
        haptic('light');
      }
      finalize(draft, message, resolution.passedGate ? 'success' : 'danger');

      return {
        ...resolution,
        rankUp,
        skillName: skill.name,
        rankLabel: newLabel,
      };
    },
    [state, finalize, haptic],
  );

  const completeQuest = useCallback(
    (activeId: string, notes?: string, evidence?: string): QuestActionResult | null => {
      if (!state) return null;
      const active = state.activeQuests.find((quest) => quest.id === activeId);
      if (!active) return null;
      const draft = cloneState(state);
      const draftActive = draft.activeQuests.find((quest) => quest.id === activeId);
      if (!draftActive) return null;
      const skill = draft.skills.find((item) => item.id === active.skillId);
      if (!skill) return null;
      const now = new Date().toISOString();
      const skillName = skill.name;

      const nextProgress = draftActive.progress + 1;
      if (nextProgress < draftActive.targetCount) {
        draftActive.progress = nextProgress;
        registerActivity(draft, now);
        addEvent(draft, {
          type: 'quest',
          title: `${draftActive.title} · step ${nextProgress}/${draftActive.targetCount}`,
          detail: `${skillName} · deliberate practice logged`,
          skillId: active.skillId,
          createdAt: now,
        });
        finalize(
          draft,
          `Step ${nextProgress} of ${draftActive.targetCount} logged · ${skillName}`,
          'success',
        );
        haptic('light');
        return {
          completed: false,
          xp: 0,
          levelsGained: 0,
          skillName,
          newLevel: skill.level,
          rankTrialReady: false,
          progress: nextProgress,
          targetCount: draftActive.targetCount,
        };
      }

      draft.activeQuests = draft.activeQuests.filter((quest) => quest.id !== activeId);
      const completion: QuestCompletion = {
        id: makeId('completion'),
        questId: active.questId,
        title: active.title,
        skillId: active.skillId,
        kind: active.kind,
        xp: active.xp,
        completedAt: now,
        notes: notes?.trim() || undefined,
        evidence: evidence?.trim() || undefined,
        demoKey: active.demoKey,
        secondarySkillIds: active.secondarySkillIds,
      };
      draft.completions.unshift(completion);

      let levelsGained = 0;
      let updatedSkill = skill;
      if (active.xp > 0) {
        const result = applyPracticeXp(skill, active.xp);
        updatedSkill = result.skill;
        levelsGained += result.levelsGained;
        draft.skills = draft.skills.map((item) =>
          item.id === updatedSkill.id ? updatedSkill : item,
        );
        for (const secondaryId of active.secondarySkillIds ?? []) {
          const secondary = draft.skills.find((item) => item.id === secondaryId);
          if (!secondary) continue;
          const secondaryResult = applyPracticeXp(secondary, secondaryXp(active.xp));
          levelsGained += secondaryResult.levelsGained;
          draft.skills = draft.skills.map((item) =>
            item.id === secondaryId ? secondaryResult.skill : item,
          );
        }
      }

      let demoCompleted = false;
      if (active.demoKey && !draft.metDemoKeys.includes(active.demoKey)) {
        draft.metDemoKeys.push(active.demoKey);
        demoCompleted = true;
      }

      registerActivity(draft, now);
      addEvent(draft, {
        type: active.kind === 'main' ? 'quest' : 'quest',
        title: active.title,
        detail:
          active.xp > 0
            ? `${skillName} · +${active.xp} XP${active.secondarySkillIds?.length ? ' · secondary credit' : ''}`
            : `${skillName} · milestone logged`,
        xp: active.xp || undefined,
        skillId: active.skillId,
        createdAt: now,
      });

      const gateAfter = getRankGate(updatedSkill, draft.metDemoKeys);
      const rankTrialReady = Boolean(gateAfter?.allMet);
      let message: string;
      if (demoCompleted) {
        message = `Demonstration complete · ${skillName}`;
        if (rankTrialReady) message += ' · Rank trial ready';
        haptic('success');
      } else if (levelsGained > 0) {
        message = `Level up! ${skillName} is now ${updatedSkill.level}`;
        haptic('success');
      } else if (active.xp > 0) {
        message = `+${active.xp} XP · ${skillName}`;
        haptic('light');
      } else {
        message = `Milestone logged · ${skillName}`;
        haptic('light');
      }
      finalize(draft, message, 'success');

      return {
        completed: true,
        xp: active.xp,
        levelsGained,
        skillName,
        newLevel: updatedSkill.level,
        rankTrialReady,
      };
    },
    [state, finalize, haptic],
  );

  const startMainQuest = useCallback(
    (quest: QuestDef) => {
      if (!state) return;
      const alreadyActive = state.activeQuests.some(
        (active) => active.kind === 'main' && active.questId === quest.id,
      );
      if (alreadyActive) {
        showToast('That is already your main quest.', 'default');
        return;
      }
      const draft = cloneState(state);
      draft.activeQuests = draft.activeQuests.filter((active) => active.kind !== 'main');
      draft.activeQuests.unshift(activeFromQuest(quest));
      addEvent(draft, {
        type: 'system',
        title: 'Main quest set',
        detail: `${quest.title} · ${quest.skillId}`,
        skillId: quest.skillId,
      });
      finalize(draft, `Main quest set · ${quest.title}`, 'success');
      haptic('success');
    },
    [state, finalize, haptic, showToast],
  );

  const addSideQuest = useCallback(
    (quest: QuestDef): boolean => {
      if (!state) return false;
      if (state.activeQuests.some((active) => active.questId === quest.id)) {
        showToast('That quest is already active.', 'default');
        return false;
      }
      const draft = cloneState(state);
      draft.activeQuests.push(activeFromQuest(quest));
      finalize(draft, `Quest added · ${quest.title}`, 'success');
      haptic('light');
      return true;
    },
    [state, finalize, haptic, showToast],
  );

  const removeActiveQuest = useCallback(
    (activeId: string) => {
      if (!state) return;
      const active = state.activeQuests.find((quest) => quest.id === activeId);
      if (!active) return;
      const draft = cloneState(state);
      draft.activeQuests = draft.activeQuests.filter((quest) => quest.id !== activeId);
      finalize(
        draft,
        active.kind === 'main' ? 'Main quest cleared.' : 'Quest set aside.',
        'default',
      );
    },
    [state, finalize],
  );

  const createCustomQuest = useCallback(
    (input: CustomQuestInput): QuestDef | null => {
      if (!state) return null;
      const title = input.title.trim();
      if (!title) return null;
      const skill = state.skills.find((item) => item.id === input.skillId);
      if (!skill) return null;
      const quest: QuestDef = {
        id: `custom-${makeId('quest')}`,
        title,
        description: input.description.trim() || 'A personal quest.',
        skillId: input.skillId,
        kind: 'side',
        source: 'custom',
        difficulty: input.difficulty,
        xp: input.skillId === 'finance' ? 0 : questDifficultyXp(input.difficulty),
        targetCount: 1,
        repeatable: input.repeatable,
        metricKey: input.metricKey ?? skill.metrics[0]?.key,
        secondarySkillIds:
          input.secondarySkillId && input.secondarySkillId !== input.skillId
            ? [input.secondarySkillId]
            : undefined,
      };
      const draft = cloneState(state);
      draft.customQuests.push(quest);
      draft.activeQuests.push(activeFromQuest(quest));
      addEvent(draft, {
        type: 'system',
        title: 'Custom quest created',
        detail: `${quest.title} · ${skill.name}`,
        skillId: quest.skillId,
      });
      finalize(draft, 'Custom quest created.', 'success');
      haptic('success');
      return quest;
    },
    [state, finalize, haptic],
  );

  const saveFinanceCheckin = useCallback(
    (values: FinanceValues, note?: string): FinanceResult | null => {
      if (!state) return null;
      const financeSkill = state.skills.find((skill) => skill.id === 'finance');
      if (!financeSkill) return null;
      const now = new Date().toISOString();
      const month = monthKey();
      const score = computeFinance(values);
      const existing = state.financeCheckins.find((checkin) => checkin.month === month);
      const priorCheckins = state.financeCheckins.filter((checkin) => checkin.month !== month).length;
      const levelResult = financeLevelWithGate(
        financeSkill.level,
        score.level,
        priorCheckins,
        values,
      );
      const previousRank = rankIndexForLevel(financeSkill.level);
      const newRank = rankIndexForLevel(levelResult.level);
      const rankUp = newRank > previousRank;
      const draft = cloneState(state);
      const target = draft.skills.find((skill) => skill.id === 'finance');
      if (!target) return null;

      const checkin: FinanceCheckin = {
        id: existing?.id ?? makeId('finance'),
        month,
        ...values,
        savingsRate: score.savingsRate,
        score: Math.round(score.weightedScore),
        level: levelResult.level,
        note: note?.trim() || undefined,
        createdAt: now,
      };

      draft.financeCheckins = [
        ...draft.financeCheckins.filter((item) => item.month !== month),
        checkin,
      ].sort((a, b) => a.month.localeCompare(b.month));

      target.level = levelResult.level;
      target.certifiedLevel = levelResult.level;
      target.scores = financeMetricsFromCheckin(checkin);
      target.assessedAt = now;
      target.xp = 0;

      registerActivity(draft, now);
      const unmet = levelResult.gate?.criteria.filter((criterion) => !criterion.met) ?? [];

      if (rankUp) {
        addEvent(draft, {
          type: 'rank-up',
          title: 'Finance rank up',
          detail: `${rankLabelForLevel(financeSkill.level, 'finance')} → ${rankLabelForLevel(
            levelResult.level,
            'finance',
          )}`,
          skillId: 'finance',
          createdAt: now,
        });
      }
      addEvent(draft, {
        type: 'finance',
        title: 'Monthly finance check-in',
        detail: `Score ${Math.round(score.weightedScore)} · Level ${levelResult.level}${
          levelResult.held ? ' · rank gate held' : ''
        }`,
        skillId: 'finance',
        createdAt: now,
      });

      let message: string;
      if (rankUp) {
        message = `Finance rank up! ${rankLabelForLevel(levelResult.level, 'finance')}`;
        haptic('success');
      } else if (levelResult.held) {
        message = `Finance gate held · ${unmet[0]?.title ?? 'requirements unmet'}`;
        haptic('warning');
      } else {
        message = `Finance check-in saved · Level ${levelResult.level}`;
        haptic('light');
      }
      finalize(draft, message, levelResult.held ? 'danger' : 'success');

      return {
        checkin,
        held: levelResult.held,
        level: levelResult.level,
        rawScore: score.level,
        rankUp,
        rankLabel: rankLabelForLevel(levelResult.level, 'finance'),
        unmet: unmet.map((criterion) => criterion.title),
      };
    },
    [state, finalize, haptic],
  );

  const saveDailyCheckin = useCallback(
    (input: Omit<DailyCheckin, 'id' | 'date' | 'createdAt'>) => {
      if (!state) return;
      const now = new Date().toISOString();
      const today = dateKey();
      const draft = cloneState(state);
      const existing = draft.dailyCheckins.find((checkin) => checkin.date === today);
      const checkin: DailyCheckin = {
        id: existing?.id ?? makeId('daily'),
        date: today,
        ...input,
        createdAt: now,
      };
      draft.dailyCheckins = [
        ...draft.dailyCheckins.filter((item) => item.date !== today),
        checkin,
      ].sort((a, b) => a.date.localeCompare(b.date));
      registerActivity(draft, now);
      addEvent(draft, {
        type: 'checkin',
        title: 'Daily check-in',
        detail: `${input.sleepHours}h sleep · Nutrition ${input.nutrition}/10 · Mood ${input.mood}/10`,
        createdAt: now,
      });
      finalize(
        draft,
        existing ? 'Daily check-in updated.' : `Check-in saved · ${draft.streak.current}-day streak`,
        'success',
      );
      haptic('light');
    },
    [state, finalize, haptic],
  );

  const importState = useCallback(
    (json: string): { ok: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(json) as unknown;
        if (!isAppState(parsed)) {
          return { ok: false, error: 'This does not look like a Peritia backup.' };
        }
        const next = normalizeImported(parsed);
        setState(next);
        setReady(true);
        showToast('Backup restored.', 'success');
        return { ok: true };
      } catch {
        return { ok: false, error: 'The backup file is not valid JSON.' };
      }
    },
    [showToast],
  );

  const eraseAllData = useCallback(async () => {
    await clearState();
    setState(null);
    setReady(true);
    dismissToast();
  }, [dismissToast]);

  const loadDemoProfile = useCallback(() => {
    const name = state?.profile.name ?? 'Pranav';
    const currency = state?.settings.currency ?? 'USD';
    setState(createDemoState(name, currency));
    showToast('Demo character loaded. Reset it any time in Settings.', 'gold');
  }, [state?.profile.name, state?.settings.currency, showToast]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      ready,
      toast,
      dismissToast,
      createProfile,
      renameProfile,
      updateSettings,
      assessSkill,
      completeQuest,
      startMainQuest,
      addSideQuest,
      removeActiveQuest,
      createCustomQuest,
      saveFinanceCheckin,
      saveDailyCheckin,
      importState,
      eraseAllData,
      loadDemoProfile,
      showToast,
    }),
    [
      state,
      ready,
      toast,
      dismissToast,
      createProfile,
      renameProfile,
      updateSettings,
      assessSkill,
      completeQuest,
      startMainQuest,
      addSideQuest,
      removeActiveQuest,
      createCustomQuest,
      saveFinanceCheckin,
      saveDailyCheckin,
      importState,
      eraseAllData,
      loadDemoProfile,
      showToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
