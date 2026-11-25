import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { BrandMark } from '../components/Brand';
import {
  Card,
  IconBubble,
  Pill,
  ProgressBar,
  RankChip,
  Screen,
  SectionHeader,
  StatTile,
} from '../components/ui';
import { BADGES } from '../data/badges';
import { deriveCharacter } from '../logic/attributes';
import { rankLabelForLevel } from '../logic/progression';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';
import { formatDate } from '../utils/date';

export function MoreScreen({
  onOpenBadges,
  onOpenFinance,
  onOpenCheckin,
  onOpenSettings,
}: {
  onOpenBadges: () => void;
  onOpenFinance: () => void;
  onOpenCheckin: () => void;
  onOpenSettings: () => void;
}) {
  const { state } = useApp();
  if (!state) return null;
  const character = deriveCharacter(state);
  const finance = state.skills.find((skill) => skill.id === 'finance');
  const financeLatest = [...state.financeCheckins].sort((a, b) =>
    b.month.localeCompare(a.month),
  )[0];
  const nextBadges = BADGES.filter(
    (badge) => !state.earnedBadges.some((earned) => earned.id === badge.id),
  ).slice(0, 3);
  const today = new Date().toISOString().slice(0, 10);
  const checkedIn = state.dailyCheckins.some((checkin) => checkin.date === today);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.wordmark}>
          <BrandMark size={16} />
          <Text style={styles.word}>PERITIA</Text>
        </View>
        {state.profile.demo ? (
          <Pill
            label="DEMO CHARACTER"
            color={colors.gold}
            background={colors.goldSoft}
            border={colors.goldBorder}
          />
        ) : (
          <Pill label="LOCAL-FIRST" color={colors.teal} background={colors.tealSoft} border={colors.tealBorder} />
        )}
      </View>

      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>
        Your character, your records, and the levers behind the system.
      </Text>

      <LinearGradient
        colors={['rgba(233,184,114,0.15)', 'rgba(18,25,36,0.96) 52%', 'rgba(15,21,31,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}
      >
        <View style={styles.profileTop}>
          <View style={styles.emblem}>
            <AppIcon name="sparkles" size={24} color={colors.gold} strokeWidth={1.4} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName} numberOfLines={1}>
              {state.profile.name}
            </Text>
            <Text style={styles.profileTitle}>{character.title}</Text>
            <Text style={styles.profileSince}>
              Playing since {formatDate(state.profile.createdAt, 'medium')}
            </Text>
          </View>
          <View style={styles.profileLevel}>
            <Text style={styles.profileLevelNumber}>{character.level}</Text>
            <Text style={styles.profileLevelLabel}>LEVEL</Text>
          </View>
        </View>
        <View style={styles.profileMeta}>
          <RankChip label={character.rankLabel} />
          <Text style={styles.profileMetaText}>
            {character.assessedSkills} skills mapped · {character.totalXp.toLocaleString()} XP
          </Text>
        </View>
        <ProgressBar
          progress={(character.level % 10) / 10}
          color={colors.gold}
          height={3}
          style={{ marginTop: 10 }}
        />
        <Pressable
          onPress={onOpenSettings}
          style={({ pressed }) => [styles.editRow, pressed && styles.pressed]}
        >
          <AppIcon name="edit" size={11} color={colors.gold} />
          <Text style={styles.editText}>Edit profile and settings</Text>
          <AppIcon name="chevronRight" size={12} color={colors.faint} />
        </Pressable>
      </LinearGradient>

      <SectionHeader title="Quick access" note="Everything else" />
      <View style={styles.grid}>
        <QuickCard
          icon="trophy"
          color={colors.gold}
          title="Badges"
          subtitle={`${state.earnedBadges.length} of ${BADGES.length} earned`}
          onPress={onOpenBadges}
        />
        <QuickCard
          icon="wallet"
          color={colors.teal}
          title="Finance"
          subtitle={
            financeLatest
              ? `${rankLabelForLevel(finance?.level ?? 0, 'finance')} · score ${financeLatest.score}`
              : 'No check-ins yet'
          }
          onPress={onOpenFinance}
        />
        <QuickCard
          icon={checkedIn ? 'check-circle' : 'moon'}
          color={checkedIn ? colors.green : colors.violet}
          title="Daily check-in"
          subtitle={checkedIn ? 'Logged today · edit' : 'Sleep, mood, nutrition, energy'}
          onPress={onOpenCheckin}
        />
        <QuickCard
          icon="settings"
          color={colors.muted}
          title="Settings"
          subtitle="Profile, data, export, reset"
          onPress={onOpenSettings}
        />
      </View>

      <SectionHeader title="At a glance" note="All-time" />
      <Card style={styles.statsCard}>
        <View style={styles.statsTop}>
          <StatTile label="Total XP" value={character.totalXp.toLocaleString()} color={colors.gold2} />
          <View style={styles.statDivider} />
          <StatTile label="Quests" value={String(state.completions.length)} />
          <View style={styles.statDivider} />
          <StatTile label="Assessments" value={String(state.assessments.length)} />
          <View style={styles.statDivider} />
          <StatTile label="Badges" value={String(state.earnedBadges.length)} color={colors.gold} />
        </View>
        <View style={styles.statsFoot}>
          <Text style={styles.statsFootText}>
            {state.activeQuests.length} active quests · {state.customQuests.length} custom quests
          </Text>
          <Text style={styles.statsFootText}>{state.streak.current} day streak</Text>
        </View>
      </Card>

      {nextBadges.length ? (
        <>
          <SectionHeader
            title="Next badges"
            note={`${nextBadges.length} closest`}
            action="View all"
            onAction={onOpenBadges}
          />
          <Card style={styles.badgesCard}>
            {nextBadges.map((badge, index) => (
              <View
                key={badge.id}
                style={[styles.badgeRow, index === nextBadges.length - 1 && styles.badgeRowLast]}
              >
                <View style={styles.badgeIcon}>
                  <AppIcon name="lock" size={12} color={colors.faint} />
                </View>
                <View style={styles.badgeCopy}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeHint}>{badge.hint}</Text>
                </View>
                <AppIcon name="chevronRight" size={12} color={colors.faint} />
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title="Data & privacy" />
      <Card style={styles.privacyCard}>
        <View style={styles.privacyTop}>
          <IconBubble icon="shield" size={36} iconSize={17} color={colors.teal} />
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>Nothing leaves this device</Text>
            <Text style={styles.privacyBody}>
              Peritia has no account, no cloud sync, and no analytics. Your full state is stored in
              a local SQLite database and can be exported as a JSON backup.
            </Text>
          </View>
        </View>
        <View style={styles.privacyRow}>
          <View style={styles.privacyPill}>
            <AppIcon name="database" size={11} color={colors.teal} />
            <Text style={styles.privacyPillText}>SQLite</Text>
          </View>
          <View style={styles.privacyPill}>
            <AppIcon name="file-json" size={11} color={colors.teal} />
            <Text style={styles.privacyPillText}>JSON export</Text>
          </View>
          <View style={styles.privacyPill}>
            <AppIcon name="globe" size={11} color={colors.faint} />
            <Text style={[styles.privacyPillText, { color: colors.faint }]}>No network</Text>
          </View>
        </View>
        <Pressable
          onPress={onOpenSettings}
          style={({ pressed }) => [styles.privacyLink, pressed && styles.pressed]}
        >
          <Text style={styles.privacyLinkText}>Manage data and backups</Text>
          <AppIcon name="arrow-right" size={12} color={colors.gold} />
        </Pressable>
      </Card>

      {state.profile.demo ? (
        <Card style={styles.demoCard} accent={colors.gold}>
          <View style={styles.demoTop}>
            <IconBubble icon="wand" size={32} iconSize={15} color={colors.gold} />
            <View style={styles.demoCopy}>
              <Text style={styles.demoTitle}>You are viewing demo data</Text>
              <Text style={styles.demoBody}>
                This character is seeded with sample history. Reset it or start fresh from
                Settings.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onOpenSettings}
            style={({ pressed }) => [styles.demoLink, pressed && styles.pressed]}
          >
            <Text style={styles.demoLinkText}>Open Settings</Text>
            <AppIcon name="chevronRight" size={12} color={colors.gold} />
          </Pressable>
        </Card>
      ) : null}

      <View style={styles.about}>
        <BrandMark size={18} />
        <Text style={styles.aboutName}>PERITIA</Text>
        <Text style={styles.aboutTagline}>Prove your proficiency.</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0 · local-first life RPG</Text>
      </View>
    </Screen>
  );
}

function QuickCard({
  icon,
  color,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
    >
      <IconBubble icon={icon} size={34} iconSize={16} color={color} />
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
      <View style={styles.quickFoot}>
        <Text style={[styles.quickAction, { color }]}>Open</Text>
        <AppIcon name="chevronRight" size={11} color={colors.faint} />
      </View>
    </Pressable>
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
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    letterSpacing: -1.1,
    color: colors.text,
    marginTop: 14,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
    marginTop: 4,
    maxWidth: 310,
  },
  profileCard: {
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: 15,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  emblem: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: 'rgba(233,184,114,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    letterSpacing: -0.55,
    color: colors.text,
  },
  profileTitle: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.gold,
    marginTop: 2,
  },
  profileSince: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
    marginTop: 3,
  },
  profileLevel: {
    alignItems: 'flex-end',
  },
  profileLevelNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 38,
    lineHeight: 38,
    letterSpacing: -1.2,
    color: colors.gold2,
  },
  profileLevelLabel: {
    fontFamily: fonts.medium,
    fontSize: 6.5,
    letterSpacing: 1.2,
    color: colors.faint,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  profileMetaText: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 11,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  editText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: colors.gold2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  quickCard: {
    width: '48.5%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,25,36,0.86)',
    padding: 12,
  },
  quickTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.text,
    marginTop: 9,
  },
  quickSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 2,
    minHeight: 24,
  },
  quickFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
  },
  quickAction: {
    fontFamily: fonts.semibold,
    fontSize: 8,
  },
  statsCard: {
    padding: 13,
  },
  statsTop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 7,
  },
  statsFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statsFootText: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
  },
  badgesCard: {
    paddingHorizontal: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.055)',
  },
  badgeRowLast: {
    borderBottomWidth: 0,
  },
  badgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.025)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCopy: {
    flex: 1,
  },
  badgeName: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  badgeHint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    marginTop: 1,
  },
  privacyCard: {
    padding: 14,
  },
  privacyTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  privacyCopy: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.text,
  },
  privacyBody: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13.5,
    color: colors.muted,
    marginTop: 3,
  },
  privacyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 11,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  privacyPillText: {
    fontFamily: fonts.medium,
    fontSize: 7.5,
    color: colors.teal,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  privacyLinkText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.gold2,
  },
  demoCard: {
    marginTop: 14,
    padding: 13,
  },
  demoTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  demoCopy: {
    flex: 1,
  },
  demoTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.text,
  },
  demoBody: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.muted,
    marginTop: 2,
  },
  demoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 9,
  },
  demoLinkText: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: colors.gold,
  },
  about: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 10,
  },
  aboutName: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 2.3,
    color: colors.gold2,
    marginTop: 7,
  },
  aboutTagline: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
    marginTop: 3,
  },
  aboutVersion: {
    fontFamily: fonts.regular,
    fontSize: 7,
    color: colors.faint,
    marginTop: 3,
  },
  pressed: {
    opacity: 0.65,
  },
});
