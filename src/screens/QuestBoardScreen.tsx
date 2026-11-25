import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { BrandMark } from '../components/Brand';
import { ActiveQuestRow } from '../components/QuestRow';
import {
  Card,
  EmptyState,
  GoldButton,
  IconBubble,
  OutlineButton,
  Pill,
  ProgressBar,
  Screen,
  SectionHeader,
} from '../components/ui';
import { CURATED_QUESTS } from '../data/quests';
import {
  availableMainQuests,
  getRankGate,
  rankLabelForLevel,
  skillById,
} from '../logic/progression';
import { useApp } from '../state/AppState';
import { colors, difficultyColor, difficultyLabel, fonts } from '../theme';
import type { QuestDef, SkillId } from '../types';

type SkillFilter = SkillId | 'all';

export function QuestBoardScreen({
  onCompleteQuest,
  onAddQuest,
}: {
  onCompleteQuest: (activeId: string) => void;
  onAddQuest: () => void;
}) {
  const { state, addSideQuest, removeActiveQuest, startMainQuest } = useApp();
  const [filter, setFilter] = useState<SkillFilter>('all');
  const activeMain = state?.activeQuests.find((quest) => quest.kind === 'main') ?? null;
  const [showMainOptions, setShowMainOptions] = useState(!activeMain);

  if (!state) return null;

  const mainSkill = activeMain ? skillById(state, activeMain.skillId) : null;
  const mainGate = mainSkill ? getRankGate(mainSkill, state.metDemoKeys) : null;
  const activeSides = state.activeQuests.filter((quest) => quest.kind === 'side');
  const activeQuestIds = new Set(state.activeQuests.map((quest) => quest.questId));
  const completedQuestIds = new Set(state.completions.map((completion) => completion.questId));
  const candidates = availableMainQuests(state).sort(
    (a, b) => skillById(state, b.skillId).level - skillById(state, a.skillId).level,
  );
  const catalog = [...CURATED_QUESTS, ...state.customQuests].filter(
    (quest) => filter === 'all' || quest.skillId === filter,
  );
  const skillOptions: Array<{ id: SkillFilter; name: string; accent: string }> = [
    { id: 'all', name: 'All skills', accent: colors.gold },
    ...state.skills.map((skill) => ({ id: skill.id, name: skill.name, accent: skill.accent })),
  ];

  const isUnavailable = (quest: QuestDef) =>
    activeQuestIds.has(quest.id) ||
    (!quest.repeatable && completedQuestIds.has(quest.id));

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.wordmark}>
          <BrandMark size={16} />
          <Text style={styles.word}>PERITIA</Text>
        </View>
        <Pill
          label={`${state.activeQuests.length} ACTIVE`}
          color={colors.gold}
          background={colors.goldSoft}
          border={colors.goldBorder}
        />
      </View>

      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={styles.title}>Quests</Text>
          <Text style={styles.subtitle}>
            One main quest for focus. Side quests for deliberate practice.
          </Text>
        </View>
        <OutlineButton label="New quest" icon="plus" onPress={onAddQuest} compact />
      </View>

      <SectionHeader
        title="Main quest"
        note="One at a time"
        action={activeMain ? (showMainOptions ? 'Hide options' : 'Change') : undefined}
        onAction={activeMain ? () => setShowMainOptions((value) => !value) : undefined}
      />

      {activeMain && mainSkill ? (
        <LinearGradient
          colors={['rgba(233,184,114,0.16)', 'rgba(18,25,36,0.97) 48%', 'rgba(15,21,31,0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainQuest}
        >
          <View style={styles.mainQuestBar} />
          <View style={styles.mainTop}>
            <View style={styles.kickerLabel}>
              <AppIcon name="target" size={12} color={colors.gold} />
              <Text style={styles.kickerText}>Main quest</Text>
            </View>
            <Text style={styles.mainSkill}>
              {mainSkill.name}
              {mainGate ? ` · ${mainGate.targetRankName}` : ''}
            </Text>
          </View>
          <Text style={styles.mainTitle}>{activeMain.title}</Text>
          <Text style={styles.mainDesc}>{activeMain.description}</Text>
          <View style={styles.segmentRow}>
            <View style={styles.segments}>
              {Array.from({ length: activeMain.targetCount }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.segment, index < activeMain.progress && styles.segmentFilled]}
                />
              ))}
            </View>
            <Text style={styles.segmentCount}>
              {activeMain.progress} / {activeMain.targetCount} attempts
            </Text>
          </View>
          <View style={styles.mainActions}>
            <GoldButton
              label={activeMain.progress > 0 ? 'Log next attempt' : 'Log first attempt'}
              icon="arrow-right"
              onPress={() => onCompleteQuest(activeMain.id)}
              compact
            />
            <Pressable
              onPress={() => removeActiveQuest(activeMain.id)}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          </View>
        </LinearGradient>
      ) : (
        <Card style={styles.mainEmpty}>
          <EmptyState
            icon="target"
            title={candidates.length ? 'Choose your focus' : 'Assess a skill first'}
            body={
              candidates.length
                ? 'A main quest is a rank-gate demonstration. Pick the skill you want to push toward its next rank.'
                : 'Main quests appear once a skill has a baseline assessment and a next rank gate.'
            }
          />
        </Card>
      )}

      {showMainOptions && candidates.length ? (
        <View style={styles.mainOptions}>
          <Text style={styles.mainOptionsNote}>
            {activeMain
              ? 'Setting another quest replaces your current main quest.'
              : 'Available demonstrations, ordered by current level.'}
          </Text>
          {candidates.slice(0, 4).map((quest) => {
            const skill = skillById(state, quest.skillId);
            const gate = getRankGate(skill, state.metDemoKeys);
            const isActive = activeMain?.questId === quest.id;
            return (
              <Pressable
                key={quest.id}
                disabled={isActive}
                onPress={() => {
                  startMainQuest(quest);
                  setShowMainOptions(false);
                }}
                style={({ pressed }) => [
                  styles.mainOption,
                  { borderColor: `${skill.accent}2a` },
                  isActive && styles.mainOptionActive,
                  pressed && !isActive && styles.pressed,
                ]}
              >
                <IconBubble icon={skill.icon} size={30} iconSize={14} color={skill.accent} />
                <View style={styles.mainOptionCopy}>
                  <Text style={styles.mainOptionTitle} numberOfLines={2}>
                    {quest.title}
                  </Text>
                  <Text style={styles.mainOptionMeta}>
                    {skill.name} · {gate ? gate.targetRankName : 'Rank gate'} · {quest.targetCount}{' '}
                    attempts
                  </Text>
                </View>
                {isActive ? (
                  <Pill label="ACTIVE" color={colors.gold} background={colors.goldSoft} border={colors.goldBorder} />
                ) : (
                  <View style={styles.optionAdd}>
                    <AppIcon name="plus" size={13} color={colors.gold} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <SectionHeader
        title="Active side quests"
        note={`${activeSides.length} in progress`}
        action="Add quest"
        onAction={onAddQuest}
      />
      <Card style={styles.activeList}>
        {activeSides.length ? (
          activeSides.map((quest) => (
            <ActiveQuestRow
              key={quest.id}
              active={quest}
              skill={skillById(state, quest.skillId)}
              onPress={() => onCompleteQuest(quest.id)}
              onRemove={() => removeActiveQuest(quest.id)}
              showProgress
            />
          ))
        ) : (
          <EmptyState
            icon="map"
            title="No side quests active"
            body="Add a small, repeatable practice quest. Small sessions are how levels actually move."
            action="Browse the library"
            onAction={() => setFilter('all')}
          />
        )}
      </Card>

      <SectionHeader
        title="Quest library"
        note={`${catalog.length} ${catalog.length === 1 ? 'quest' : 'quests'}`}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterWrap}
      >
        {skillOptions.map((option) => {
          const active = option.id === filter;
          return (
            <Pressable
              key={option.id}
              onPress={() => setFilter(option.id)}
              style={[
                styles.filterChip,
                active && {
                  borderColor: `${option.accent}66`,
                  backgroundColor: `${option.accent}18`,
                },
              ]}
            >
              <Text style={[styles.filterText, active && { color: option.accent }]}>
                {option.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.catalog}>
        {catalog.map((quest) => {
          const skill = skillById(state, quest.skillId);
          const unavailable = isUnavailable(quest);
          const active = activeQuestIds.has(quest.id);
          const completed = !quest.repeatable && completedQuestIds.has(quest.id);
          const metric = skill.metrics.find((item) => item.key === quest.metricKey);
          return (
            <View key={quest.id} style={[styles.questRow, { borderColor: `${skill.accent}18` }]}>
              <IconBubble icon={skill.icon} size={32} iconSize={15} color={skill.accent} />
              <View style={styles.questCopy}>
                <View style={styles.questTitleRow}>
                  <Text style={styles.questTitle} numberOfLines={2}>
                    {quest.title}
                  </Text>
                  {quest.source === 'custom' ? (
                    <Pill label="CUSTOM" color={colors.violet} background={colors.violetSoft} border={colors.violetBorder} />
                  ) : null}
                </View>
                <Text style={styles.questDesc} numberOfLines={2}>
                  {quest.description}
                </Text>
                <View style={styles.questMeta}>
                  <Text style={styles.questMetaText}>{skill.name}</Text>
                  <View style={styles.metaDot} />
                  <Text style={[styles.questMetaText, { color: difficultyColor[quest.difficulty] }]}>
                    {difficultyLabel[quest.difficulty]}
                  </Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.questMetaText}>
                    {quest.xp > 0 ? `+${quest.xp} XP` : 'Milestone'}
                  </Text>
                  {metric ? (
                    <>
                      <View style={styles.metaDot} />
                      <Text style={styles.questMetaText}>{metric.short}</Text>
                    </>
                  ) : null}
                  {quest.secondarySkillIds?.length ? (
                    <>
                      <View style={styles.metaDot} />
                      <Text style={styles.questMetaText}>+ secondary</Text>
                    </>
                  ) : null}
                </View>
              </View>
              {active ? (
                <View style={styles.stateTag}>
                  <Text style={styles.stateTagTextActive}>ACTIVE</Text>
                </View>
              ) : completed ? (
                <View style={styles.stateTag}>
                  <Text style={styles.stateTagTextDone}>DONE</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => addSideQuest(quest)}
                  disabled={unavailable}
                  style={({ pressed }) => [
                    styles.addButton,
                    { borderColor: `${skill.accent}44` },
                    pressed && styles.pressed,
                  ]}
                >
                  <AppIcon name="plus" size={14} color={skill.accent} strokeWidth={2.2} />
                </Pressable>
              )}
            </View>
          );
        })}
        {!catalog.length ? (
          <Card>
            <EmptyState
              icon="search"
              title="No quests for this skill"
              body="Try another skill filter, or create a custom quest that fits your practice."
              action="Create a quest"
              onAction={onAddQuest}
            />
          </Card>
        ) : null}
      </View>

      <Card style={styles.customCard}>
        <View style={styles.customTop}>
          <IconBubble icon="scroll" size={34} iconSize={16} color={colors.violet} />
          <View style={styles.customCopy}>
            <Text style={styles.customTitle}>Forge your own quest</Text>
            <Text style={styles.customBody}>
              Name a specific practice session, pick a primary skill, and optionally give
              secondary credit.
            </Text>
          </View>
        </View>
        <OutlineButton
          label="Create custom quest"
          icon="plus"
          onPress={onAddQuest}
          style={{ marginTop: 11 }}
        />
      </Card>

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          Main quests require three logged attempts to prove the rank standard. Side quests award
          practice XP, capped at your current rank ceiling.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  word: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.gold2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  titleCopy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    letterSpacing: -1.1,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
    marginTop: 4,
    maxWidth: 280,
  },
  mainQuest: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(233,184,114,0.26)',
    padding: 15,
    overflow: 'hidden',
  },
  mainQuestBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.gold,
  },
  mainTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kickerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  kickerText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    letterSpacing: 1.35,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  mainSkill: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    flexShrink: 1,
    textAlign: 'right',
  },
  mainTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    letterSpacing: -0.35,
    color: colors.text,
    marginTop: 10,
  },
  mainDesc: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: colors.muted,
    marginTop: 4,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 13,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  segmentFilled: {
    backgroundColor: colors.gold,
  },
  segmentCount: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: colors.gold2,
  },
  mainActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 13,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  clearText: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.faint,
  },
  mainEmpty: {
    padding: 2,
  },
  mainOptions: {
    gap: 7,
    marginTop: 10,
  },
  mainOptionsNote: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
    paddingHorizontal: 2,
    marginBottom: 1,
  },
  mainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(18,25,36,0.82)',
  },
  mainOptionActive: {
    opacity: 0.6,
  },
  mainOptionCopy: {
    flex: 1,
  },
  mainOptionTitle: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    color: colors.text,
  },
  mainOptionMeta: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
    marginTop: 2,
  },
  optionAdd: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeList: {
    overflow: 'hidden',
  },
  filterWrap: {
    marginHorizontal: -18,
    marginBottom: 12,
  },
  filterRow: {
    paddingHorizontal: 18,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  filterText: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.muted,
  },
  catalog: {
    gap: 8,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(18,25,36,0.86)',
  },
  questCopy: {
    flex: 1,
    minWidth: 0,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  questTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.text,
    flexShrink: 1,
  },
  questDesc: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 2,
  },
  questMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  questMetaText: {
    fontFamily: fonts.medium,
    fontSize: 7,
    color: colors.faint,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.025)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTag: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  stateTagTextActive: {
    fontFamily: fonts.semibold,
    fontSize: 6,
    letterSpacing: 0.7,
    color: colors.gold,
  },
  stateTagTextDone: {
    fontFamily: fonts.semibold,
    fontSize: 6,
    letterSpacing: 0.7,
    color: colors.faint,
  },
  customCard: {
    marginTop: 18,
    padding: 14,
  },
  customTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  customCopy: {
    flex: 1,
  },
  customTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  customBody: {
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: colors.muted,
    marginTop: 3,
  },
  pressed: {
    opacity: 0.65,
  },
  footerNote: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 2,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.faint,
  },
});
