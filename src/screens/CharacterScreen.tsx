import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { BrandMark } from '../components/Brand';
import { ActiveQuestRow } from '../components/QuestRow';
import { RadarChart } from '../components/RadarChart';
import {
  Card,
  EmptyState,
  GoldButton,
  IconBubble,
  Pill,
  ProgressBar,
  RankChip,
  Screen,
  SectionHeader,
} from '../components/ui';
import { deriveCharacter } from '../logic/attributes';
import { getRankGate, rankLabelForLevel, skillById } from '../logic/progression';
import { reassessmentsDue } from '../logic/reminders';
import { useApp } from '../state/AppState';
import { colors, fonts, radii } from '../theme';
import type { SkillId } from '../types';
import { formatDate, todayKey } from '../utils/date';
import { formatPercent } from '../utils/format';

export function CharacterScreen({
  onOpenSkill,
  onOpenSkills,
  onOpenQuests,
  onOpenJournal,
  onOpenCheckin,
  onCompleteQuest,
}: {
  onOpenSkill: (id: SkillId) => void;
  onOpenSkills: () => void;
  onOpenQuests: () => void;
  onOpenJournal: () => void;
  onOpenCheckin: () => void;
  onCompleteQuest: (activeId: string) => void;
}) {
  const { state } = useApp();
  if (!state) return null;
  const character = deriveCharacter(state);
  const mainQuest = state.activeQuests.find((quest) => quest.kind === 'main') ?? null;
  const mainSkill = mainQuest ? skillById(state, mainQuest.skillId) : null;
  const mainGate = mainSkill ? getRankGate(mainSkill, state.metDemoKeys) : null;
  const sideQuests = state.activeQuests.filter((quest) => quest.kind === 'side');
  const today = todayKey();
  const checkin = state.dailyCheckins.find((item) => item.date === today);
  const due = state.settings.assessmentReminders ? reassessmentsDue(state) : [];
  const trackedSkills = state.skills.filter(
    (skill) =>
      skill.assessedAt !== null ||
      (skill.id === 'finance' && state.financeCheckins.length > 0),
  );
  const stripSkills =
    character.assessedSkills > 0
      ? [...state.skills].sort((a, b) => b.level - a.level).slice(0, 4)
      : state.skills.slice(0, 4);
  const xpIntoLevel = character.totalXp % 500;
  const heroProgress = xpIntoLevel / 500;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.wordmark}>
            <BrandMark size={16} />
            <Text style={styles.word}>PERITIA</Text>
          </View>
          {state.profile.demo ? (
            <Pill
              label="DEMO"
              color={colors.gold}
              background={colors.goldSoft}
              border={colors.goldBorder}
            />
          ) : null}
        </View>
        <Pressable
          onPress={onOpenJournal}
          style={({ pressed }) => [styles.streakPill, pressed && styles.pressed]}
        >
          <AppIcon name="flame" size={12} color={colors.gold2} />
          <Text style={styles.streakText}>
            <Text style={styles.streakStrong}>{state.streak.current}</Text> day streak
          </Text>
        </Pressable>
      </View>

      <LinearGradient
        colors={['rgba(233,184,114,0.16)', 'rgba(18,25,36,0.96) 46%', 'rgba(15,21,31,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroStar}>✦</Text>
        <View style={styles.heroTop}>
          <View style={styles.emblem}>
            <AppIcon name="sparkles" size={25} color={colors.gold} strokeWidth={1.4} />
          </View>
          <View style={styles.identity}>
            <Text style={styles.heroName} numberOfLines={1}>
              {state.profile.name}
            </Text>
            <Text style={styles.heroTitle}>{character.title}</Text>
          </View>
          <View style={styles.levelBlock}>
            <Text style={styles.levelNumber}>{character.level}</Text>
            <Text style={styles.levelLabel}>LEVEL</Text>
          </View>
        </View>

        <View style={styles.rankRow}>
          <RankChip label={character.rankLabel} />
          <Text style={styles.rankNote}>Rank {character.rank + 1} of 10</Text>
          <Text style={styles.xpLabel}>
            {xpIntoLevel} / 500 XP
          </Text>
        </View>
        <ProgressBar progress={heroProgress} gradient height={4} style={{ marginTop: 9 }} />
        <View style={styles.heroFooter}>
          <Text style={styles.heroHint}>
            {character.assessedSkills === 0
              ? 'Assess your first skill to set a true baseline.'
              : `${character.assessedSkills} skills tracked · ${character.totalXp.toLocaleString()} total XP`}
          </Text>
          <Text style={styles.heroFooterMark}>PROFICIENCY FIRST</Text>
        </View>
      </LinearGradient>

      {character.assessedSkills === 0 ? (
        <Card style={styles.starterCard} accent={colors.gold}>
          <View style={styles.starterRow}>
            <IconBubble icon="scan" size={38} iconSize={18} color={colors.gold} />
            <View style={styles.starterCopy}>
              <Text style={styles.starterTitle}>Your character is unwritten.</Text>
              <Text style={styles.starterBody}>
                Score each skill's metrics once. That baseline becomes your real starting level —
                not zero.
              </Text>
            </View>
          </View>
          <GoldButton
            label="Assess a skill"
            icon="arrow-right"
            onPress={onOpenSkills}
            compact
            style={{ marginTop: 13 }}
          />
        </Card>
      ) : null}

      {due.length > 0 ? (
        <Pressable
          onPress={onOpenSkills}
          style={({ pressed }) => [styles.dueBanner, pressed && styles.pressed]}
        >
          <IconBubble icon="clock" size={28} iconSize={13} color={colors.violet} />
          <Text style={styles.dueText}>
            <Text style={styles.dueStrong}>{due.length}</Text>{' '}
            {due.length === 1 ? 'skill is' : 'skills are'} due for a 90-day re-assessment.
          </Text>
          <AppIcon name="chevronRight" size={13} color={colors.faint} />
        </Pressable>
      ) : null}

      <SectionHeader title="Attributes" note="Derived from skills" />
      <Card style={styles.attributesCard}>
        <View style={styles.radarWrap}>
          <RadarChart attributes={character.attributes} size={146} />
        </View>
        <View style={styles.attributeList}>
          {character.attributes.map((attribute) => (
            <View key={attribute.key} style={styles.attribute}>
              <View style={styles.attributeTop}>
                <Text style={styles.attributeLabel}>{attribute.short}</Text>
                <Text style={styles.attributeValue}>{attribute.value}</Text>
              </View>
              <ProgressBar
                progress={attribute.value / 100}
                height={2}
                gradient
                style={{ marginTop: 4 }}
              />
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader
        title="Focus"
        note={`1 main · ${sideQuests.length} side`}
        action="Quest board"
        onAction={onOpenQuests}
      />

      {mainQuest && mainSkill ? (
        <LinearGradient
          colors={['rgba(233,184,114,0.15)', 'rgba(18,25,36,0.97) 48%', 'rgba(15,21,31,0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainQuest}
        >
          <View style={styles.mainQuestBar} />
          <View style={styles.questKicker}>
            <View style={styles.kickerLabel}>
              <AppIcon name="target" size={12} color={colors.gold} />
              <Text style={styles.kickerText}>Main quest</Text>
            </View>
            <Text style={styles.questSkill}>
              {mainSkill.name}
              {mainGate ? ` · ${mainGate.targetRankName}` : ' · Rank gate'}
            </Text>
          </View>
          <Text style={styles.questTitle}>{mainQuest.title}</Text>
          <Text style={styles.questSub}>
            {mainGate
              ? `Demonstrate the standard for ${mainGate.targetRankName}.`
              : mainQuest.description}
          </Text>
          <View style={styles.segmentRow}>
            <View style={styles.segments}>
              {Array.from({ length: mainQuest.targetCount }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.segment, index < mainQuest.progress && styles.segmentFilled]}
                />
              ))}
            </View>
            <Text style={styles.questCount}>
              {mainQuest.progress} / {mainQuest.targetCount}
            </Text>
          </View>
          <View style={styles.questActions}>
            <View style={styles.xpChip}>
              <Text style={styles.xpChipText}>+{mainQuest.xp} XP</Text>
            </View>
            <GoldButton
              label={mainQuest.progress > 0 ? 'Continue' : 'Log attempt'}
              icon="arrow-right"
              onPress={() => onCompleteQuest(mainQuest.id)}
              compact
            />
          </View>
        </LinearGradient>
      ) : (
        <Card style={styles.emptyFocus}>
          <EmptyState
            icon="target"
            title={character.assessedSkills === 0 ? 'Assess first, then focus' : 'Choose a main quest'}
            body={
              character.assessedSkills === 0
                ? 'Your main quest will appear once a skill has a baseline and a rank gate.'
                : 'One main quest keeps your practice pointed at the next rank gate.'
            }
            action="Open quest board"
            onAction={onOpenQuests}
          />
        </Card>
      )}

      <SectionHeader
        title="Side quests"
        note={`${sideQuests.length} active`}
        action="View all"
        onAction={onOpenQuests}
      />
      <Card style={styles.questList}>
        {sideQuests.length ? (
          sideQuests.slice(0, 3).map((quest) => {
            const skill = skillById(state, quest.skillId);
            return (
              <ActiveQuestRow
                key={quest.id}
                active={quest}
                skill={skill}
                onPress={() => onCompleteQuest(quest.id)}
              />
            );
          })
        ) : (
          <EmptyState
            icon="map"
            title="No side quests active"
            body="Add a small, repeatable practice quest to keep momentum."
            action="Browse quests"
            onAction={onOpenQuests}
          />
        )}
      </Card>

      <SectionHeader title="Today" note="Ritual check-in" />
      <Pressable
        onPress={onOpenCheckin}
        style={({ pressed }) => [styles.checkinCard, pressed && styles.pressed]}
      >
        <IconBubble
          icon={checkin ? 'check-circle' : 'moon'}
          size={36}
          iconSize={17}
          color={checkin ? colors.green : colors.violet}
        />
        <View style={styles.checkinCopy}>
          <Text style={styles.checkinTitle}>
            {checkin ? 'Daily check-in complete' : 'How did today go?'}
          </Text>
          <Text style={styles.checkinBody} numberOfLines={1}>
            {checkin
              ? `${checkin.sleepHours}h sleep · Nutrition ${checkin.nutrition}/10 · Mood ${checkin.mood}/10`
              : 'Log sleep, nutrition, mood, and energy in 20 seconds.'}
          </Text>
        </View>
        <Text style={styles.checkinAction}>{checkin ? 'Edit' : 'Log'}</Text>
        <AppIcon name="chevronRight" size={13} color={colors.faint} />
      </Pressable>

      <SectionHeader
        title="Skills"
        note={trackedSkills.length ? `${trackedSkills.length} tracked` : 'Unassessed'}
        action="View all"
        onAction={onOpenSkills}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.skillStrip}
        style={styles.skillStripWrap}
      >
        {stripSkills.map((skill) => {
          const tracked =
            skill.assessedAt !== null ||
            (skill.id === 'finance' && state.financeCheckins.length > 0);
          const progress =
            skill.type === 'continuous' ? skill.level / 100 : Math.min(1, skill.xp / 100);
          return (
            <Pressable
              key={skill.id}
              onPress={() => onOpenSkill(skill.id)}
              style={({ pressed }) => [
                styles.skillCard,
                { borderColor: `${skill.accent}22` },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.skillGlow, { backgroundColor: skill.accent }]} />
              <View style={styles.skillTop}>
                <IconBubble
                  icon={skill.icon}
                  size={28}
                  iconSize={14}
                  color={skill.accent}
                />
                <Text style={styles.skillLevel}>{tracked ? skill.level : '—'}</Text>
              </View>
              <Text style={styles.skillName} numberOfLines={1}>
                {skill.name}
              </Text>
              <Text style={[styles.skillRank, { color: tracked ? colors.faint : skill.accent }]}>
                {tracked ? rankLabelForLevel(skill.level, skill.id) : 'Unassessed'}
              </Text>
              <ProgressBar
                progress={tracked ? progress : 0}
                color={skill.accent}
                height={2}
                style={{ marginTop: 8 }}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Last active {formatDate(today, 'short')}</Text>
        <Text style={styles.footerText}>
          {state.completions.length} sessions · {formatPercent((character.assessedSkills / 9) * 100)} assessed
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
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  streakText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.gold2,
  },
  streakStrong: {
    fontFamily: fonts.bold,
  },
  pressed: {
    opacity: 0.68,
  },
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  heroStar: {
    position: 'absolute',
    right: 12,
    bottom: -30,
    fontSize: 110,
    color: 'rgba(233,184,114,0.035)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emblem: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: 'rgba(233,184,114,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  heroName: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    letterSpacing: -0.7,
    color: colors.text,
  },
  heroTitle: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    letterSpacing: 1.55,
    textTransform: 'uppercase',
    color: colors.gold,
    marginTop: 3,
  },
  levelBlock: {
    alignItems: 'flex-end',
  },
  levelNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 42,
    lineHeight: 39,
    color: colors.gold2,
    letterSpacing: -1.6,
  },
  levelLabel: {
    fontFamily: fonts.medium,
    fontSize: 7,
    letterSpacing: 1.5,
    color: colors.faint,
    marginTop: 4,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 15,
  },
  rankNote: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.faint,
  },
  xpLabel: {
    marginLeft: 'auto',
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  heroHint: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
    flex: 1,
  },
  heroFooterMark: {
    fontFamily: fonts.medium,
    fontSize: 6.5,
    letterSpacing: 1.1,
    color: 'rgba(233,184,114,0.5)',
  },
  starterCard: {
    marginTop: 14,
    padding: 14,
  },
  starterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  starterCopy: {
    flex: 1,
  },
  starterTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  starterBody: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15.5,
    color: colors.muted,
    marginTop: 3,
  },
  dueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 12,
    padding: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.violetBorder,
    backgroundColor: colors.violetSoft,
  },
  dueText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  dueStrong: {
    fontFamily: fonts.semibold,
    color: colors.violet,
  },
  attributesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 4,
    paddingRight: 12,
  },
  radarWrap: {
    width: 148,
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attributeList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 8,
    paddingLeft: 2,
  },
  attribute: {
    width: '45%',
    minWidth: 0,
  },
  attributeTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  attributeLabel: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    letterSpacing: 1,
    color: colors.faint,
  },
  attributeValue: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  mainQuest: {
    borderRadius: radii.xl,
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
  questKicker: {
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
  questSkill: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    flexShrink: 1,
    textAlign: 'right',
  },
  questTitle: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    letterSpacing: -0.35,
    color: colors.text,
    marginTop: 10,
  },
  questSub: {
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
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  questCount: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.gold2,
  },
  questActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  xpChip: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    backgroundColor: colors.tealSoft,
  },
  xpChipText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: colors.teal,
  },
  emptyFocus: {
    padding: 4,
  },
  questList: {
    overflow: 'hidden',
  },
  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,25,36,0.72)',
    padding: 11,
  },
  checkinCopy: {
    flex: 1,
    minWidth: 0,
  },
  checkinTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  checkinBody: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
    marginTop: 2,
  },
  checkinAction: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.gold,
  },
  skillStripWrap: {
    marginHorizontal: -18,
  },
  skillStrip: {
    paddingHorizontal: 18,
    paddingBottom: 4,
    gap: 9,
  },
  skillCard: {
    width: 126,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(18,25,36,0.92)',
    padding: 11,
    overflow: 'hidden',
  },
  skillGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    right: -32,
    top: -36,
    borderRadius: 35,
    opacity: 0.12,
  },
  skillTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillLevel: {
    fontFamily: fonts.displayBold,
    fontSize: 23,
    lineHeight: 25,
    color: colors.text,
  },
  skillName: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: colors.text,
    marginTop: 9,
  },
  skillRank: {
    fontFamily: fonts.semibold,
    fontSize: 7,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 2,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
  },
});
