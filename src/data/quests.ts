import type { QuestDef, SkillId } from '../types';

const side = (
  id: string,
  title: string,
  description: string,
  skillId: SkillId,
  difficulty: QuestDef['difficulty'],
  xp: number,
  metricKey: string,
  repeatable = true,
  secondarySkillIds?: SkillId[],
): QuestDef => ({
  id,
  title,
  description,
  skillId,
  kind: 'side',
  source: 'curated',
  difficulty,
  xp,
  targetCount: 1,
  repeatable,
  metricKey,
  secondarySkillIds,
});

export const CURATED_QUESTS: QuestDef[] = [
  side('side-guitar-scales', 'Practice scales for 20 min', 'Slow, deliberate scale work with a metronome.', 'guitar', 'easy', 10, 'technique'),
  side('side-guitar-song', 'Learn one song section', 'Learn and clean up a new section of a song.', 'guitar', 'medium', 20, 'repertoire'),
  side('side-guitar-rhythm', 'Metronome groove workout', 'Lock into a groove for 15 minutes without drifting.', 'guitar', 'easy', 10, 'rhythm'),
  side('side-guitar-ear', 'Transcribe a short phrase', 'Work out a phrase by ear, then play it cleanly.', 'guitar', 'medium', 20, 'theory'),

  side('side-harmonica-breath', 'Long-tone breath work', 'Ten minutes of supported long tones and clean single notes.', 'harmonica', 'easy', 10, 'tone'),
  side('side-harmonica-lick', 'Learn one blues lick', 'Learn a lick in two positions and make it feel natural.', 'harmonica', 'medium', 20, 'improvisation'),
  side('side-harmonica-song', 'Play a song from memory', 'Run a full melody from memory without looking at tabs.', 'harmonica', 'medium', 20, 'repertoire'),

  side('side-sketch-gesture', 'Ten gesture drawings', 'Capture the whole figure in under two minutes per pose.', 'sketching', 'easy', 10, 'lineForm'),
  side('side-sketch-value', 'Thirty-minute value study', 'One light source, three values, no blending shortcuts.', 'sketching', 'medium', 20, 'valueLight'),
  side('side-sketch-finish', 'Finish one sketch', 'Take a study to a polished, presentable result.', 'sketching', 'hard', 30, 'finishedWork'),
  side('side-sketch-3d', 'Sketch a 3D prop concept', 'Design a prop with a clear front, side, and top read.', 'sketching', 'medium', 20, 'composition', true, ['three-d']),

  side('side-3d-blockout', 'Block out one prop', 'Get the silhouette and proportions right before details.', 'three-d', 'medium', 20, 'modeling'),
  side('side-3d-material', 'Build a PBR material study', 'Create a material from observation, not a preset.', 'three-d', 'medium', 20, 'materials'),
  side('side-3d-render', 'Light and render a scene', 'Use lighting to establish a clear mood and focal point.', 'three-d', 'hard', 30, 'lighting'),

  side('side-language-listening', 'Fifteen-minute listening drill', 'Listen once for gist, once for detail, then summarize.', 'language', 'easy', 10, 'listening'),
  side('side-language-speaking', 'Twenty-minute speaking drill', 'Record yourself answering five open questions.', 'language', 'medium', 20, 'speaking'),
  side('side-language-writing', 'Write a short journal entry', 'Write ten sentences about your day, then self-correct.', 'language', 'easy', 10, 'writing'),

  side('side-dsa-problem', 'Solve one DSA problem', 'Pick a problem just beyond your comfort zone.', 'dsa', 'medium', 20, 'problemSolving'),
  side('side-dsa-explain', 'Explain a solution out loud', 'Narrate the approach, tradeoffs, and complexity before coding.', 'dsa', 'easy', 10, 'communication', true, ['language']),
  side('side-dsa-review', 'Review a failed problem', 'Re-solve a problem you missed without looking at the answer.', 'dsa', 'easy', 10, 'implementation'),

  side('side-bodybuilding-push', '45-minute push session', 'A focused session with progressive overload.', 'bodybuilding', 'medium', 20, 'strength'),
  side('side-bodybuilding-pull', '45-minute pull session', 'Controlled reps, full range, and a clear progression.', 'bodybuilding', 'medium', 20, 'strength'),
  side('side-bodybuilding-mobility', 'Mobility and technique work', 'Fifteen minutes of joint prep and technique practice.', 'bodybuilding', 'easy', 10, 'technique'),

  side('side-martial-drill', 'Twenty-minute technique drill', 'Slow, clean repetitions of one core movement.', 'martial-arts', 'easy', 10, 'technique'),
  side('side-martial-spar', 'Controlled sparring round', 'One round focused on defense and distance.', 'martial-arts', 'hard', 30, 'sparring'),
  side('side-martial-conditioning', 'Conditioning circuit', 'Three rounds of work that builds usable capacity.', 'martial-arts', 'medium', 20, 'conditioning'),

  side('side-finance-checkin', 'Complete the monthly check-in', 'Update income, expenses, and resilience metrics.', 'finance', 'medium', 0, 'savingsScore', true),
  side('side-finance-expenses', 'Track expenses for 30 days', 'Log every expense for a full month.', 'finance', 'hard', 0, 'savingsScore', false),
  side('side-finance-emergency', 'Build a one-month emergency fund', 'Set aside one month of essential expenses.', 'finance', 'medium', 0, 'emergencyScore', false),
  side('side-finance-automate', 'Automate a savings transfer', 'Move savings on payday before it can disappear.', 'finance', 'easy', 0, 'savingsScore', false),
  side('side-finance-income', 'Create a side income stream', 'Launch one small, repeatable source of income.', 'finance', 'hard', 0, 'passiveScore', false),
];

export const CURATED_QUEST_BY_ID = Object.fromEntries(
  CURATED_QUESTS.map((quest) => [quest.id, quest]),
) as Record<string, QuestDef>;

export const STARTER_SIDE_QUESTS = [
  'side-guitar-scales',
  'side-dsa-problem',
  'side-bodybuilding-push',
];

export const FINANCE_QUEST_IDS = CURATED_QUESTS.filter((q) => q.skillId === 'finance').map(
  (q) => q.id,
);

export function questDifficultyXp(difficulty: QuestDef['difficulty']): number {
  if (difficulty === 'easy') return 10;
  if (difficulty === 'medium') return 20;
  return 30;
}
