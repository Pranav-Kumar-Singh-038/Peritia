import React, { useState } from 'react';
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
  SegmentedControl,
  StatTile,
} from '../components/ui';
import { deriveCharacter } from '../logic/attributes';
import { financeMetricsFromCheckin, getFinanceGate } from '../logic/finance';
import {
  getRankGate,
  levelCeilingForRank,
  rankIndexForLevel,
  rankLabelForLevel,
} from '../logic/progression';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';
import type { SkillId, SkillState } from '../types';
import { monthKey, relativeDate } from '../utils/date';
import { formatPercent } from '../utils/format';

type Filter = 'all' | 'tracked' | 'untracked';

export function SkillsScreen({
  onOpenSkill,
  onOpenFinance,
  onAssess,
}: {
  onOpenSkill: (id: SkillId) => void;
  onOpenFinance: () => void;
  onAssess: (id: SkillId) => void;
}) {
  const { state } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  if (!state) return null;
  const character = deriveCharacter(state);
  const currentMonth = monthKey();

  const isTracked = (skill: SkillState) =>
    skill.assessedAt !== null || (skill.id === 'finance' && state.financeCheckins.length > 0);

  const visible = state.skills.filter((skill) => {
    if (filter === 'all') return true;
    if (filter === 'tracked') return isTracked(skill);
    return !isTracked(skill);
  });

  const rankReady = state.skills.filter((skill) => {
    if (skill.type === 'continuous') {
      return false;
    }
    const gate = getRankGate(skill, state.metDemoKeys);
    return Boolean(gate?.allMet);
  }).length;

  const summary = {
    average: character.level,
    tracked: state.skills.filter(isTracked).length,
    rankReady,
    totalXp: character.totalXp,
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.wordmark}>
          <BrandMark size={16} />
          <Text style={styles.word}>PERITIA</Text>
        </View>
        <Pill
          label={`${summary.tracked} / 9 TRACKED`}
          color={colors.gold}
          background={colors.goldSoft}
          border={colors.goldBorder}
        />
      </View>

      <Text style={styles.title}>Skills</Text>
      <Text style={styles.subtitle}>
        Nine disciplines. Every level is backed by a metric profile.
      </Text>

      <Card style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <StatTile label="Character level" value={String(summary.average)} color={colors.gold2} />
          <View style={styles.summaryDivider} />
          <StatTile label="Skills tracked" value={`${summary.tracked}/9`} />
          <View style={styles.summaryDivider} />
          <StatTile
            label="Rank trials ready"
            value={String(summary.rankReady)}
            color={summary.rankReady ? colors.teal : colors.text}
          />
        </View>
        <View style={styles.summaryFoot}>
          <Text style={styles.summaryFootText}>{summary.totalXp.toLocaleString()} total XP</Text>
          <Text style={styles.summaryFootText}>{formatPercent((summary.tracked / 9) * 100)} mapped</Text>
        </View>
      </Card>

      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { key: 'all', label: 'All', count: state.skills.length },
          { key: 'tracked', label: 'Tracked', count: summary.tracked },
          { key: 'untracked', label: 'Unassessed', count: 9 - summary.tracked },
        ]}
        style={{ marginTop: 16 }}
      />

      <SectionHeader
        title={filter === 'all' ? 'Roster' : filter === 'tracked' ? 'Tracked skills' : 'Unassessed skills'}
        note={`${visible.length} ${visible.length === 1 ? 'skill' : 'skills'}`}
      />

      <View style={styles.list}>
        {visible.map((skill) => {
          const tracked = isTracked(skill);
          const financeCheckin =
            skill.id === 'finance'
              ? [...state.financeCheckins].sort((a, b) => b.month.localeCompare(a.month))[0] ?? null
              : null;
          const gate =
            skill.type === 'continuous'
              ? getFinanceGate(skill, financeCheckin)
              : getRankGate(skill, state.metDemoKeys);
          const gateReady = Boolean(gate?.allMet);
          const atCeiling =
            tracked && skill.level >= levelCeilingForRank(rankIndexForLevel(skill.level));
          const rankProgress =
            skill.type === 'continuous'
              ? skill.level / 100
              : atCeiling
                ? 1
                : Math.min(1, skill.xp / 100);
          const keyMetrics = skill.metrics.filter((metric) => skill.keyMetrics.includes(metric.key));
          const scores: Record<string, number> | null = financeCheckin
            ? financeMetricsFromCheckin(financeCheckin)
            : skill.scores;

          const due =
            skill.type === 'continuous' &&
            tracked &&
            financeCheckin &&
            financeCheckin.month !== currentMonth;

          return (
            <Pressable
              key={skill.id}
              onPress={() =>
                skill.id === 'finance' ? onOpenFinance() : onOpenSkill(skill.id)
              }
              style={({ pressed }) => [
                styles.skillCard,
                { borderColor: `${skill.accent}22` },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.accentBar, { backgroundColor: skill.accent }]} />
              <View style={[styles.glow, { backgroundColor: skill.accent }]} />
              <View style={styles.skillHead}>
                <IconBubble icon={skill.icon} size={40} iconSize={19} color={skill.accent} />
                <View style={styles.skillInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    {skill.id === 'finance' ? <Pill label="CONTINUOUS" color={colors.teal} background={colors.tealSoft} border={colors.tealBorder} /> : null}
                  </View>
                  <Text style={styles.skillMeta}>
                    {skill.category} · {skill.metrics.length} metrics
                    {tracked && skill.assessedAt ? ` · assessed ${relativeDate(skill.assessedAt)}` : ''}
                  </Text>
                </View>
                <View style={styles.levelBlock}>
                  <Text style={styles.level}>{tracked ? skill.level : '—'}</Text>
                  <Text style={styles.levelLabel}>{tracked ? 'LEVEL' : 'UNSET'}</Text>
                </View>
              </View>

              <View style={styles.rankLine}>
                {tracked ? (
                  <RankChip label={rankLabelForLevel(skill.level, skill.id)} color={skill.accent} />
                ) : (
                  <Pill label="Needs assessment" color={colors.faint} />
                )}
                {gateReady ? (
                  <View style={styles.readyTag}>
                    <AppIcon name="sparkles" size={9} color={colors.teal} />
                    <Text style={styles.readyText}>Rank trial ready</Text>
                  </View>
                ) : due ? (
                  <Text style={styles.dueText}>Monthly check-in due</Text>
                ) : tracked && gate ? (
                  <Text style={styles.gateText}>
                    Next: {gate.targetRankName} · {gate.targetLevel}
                  </Text>
                ) : null}
              </View>

              {tracked ? (
                <>
                  <ProgressBar
                    progress={rankProgress}
                    color={skill.accent}
                    height={3}
                    style={{ marginTop: 11 }}
                  />
                  <View style={styles.metricRow}>
                    {keyMetrics.slice(0, 2).map((metric) => {
                      const score = scores?.[metric.key] ?? 0;
                      return (
                        <View key={metric.key} style={styles.metric}>
                          <View style={styles.metricTop}>
                            <Text style={styles.metricLabel}>{metric.short}</Text>
                            <Text style={styles.metricValue}>{Math.round(score)}</Text>
                          </View>
                          <ProgressBar
                            progress={score / 100}
                            color={skill.accent}
                            height={2}
                          />
                        </View>
                      );
                    })}
                    <View style={styles.metric}>
                      <View style={styles.metricTop}>
                        <Text style={styles.metricLabel}>
                          {skill.type === 'continuous' ? 'SCORE' : 'XP'}
                        </Text>
                        <Text style={styles.metricValue}>
                          {skill.type === 'continuous'
                            ? financeCheckin?.score ?? 0
                            : `${skill.xp}/100`}
                        </Text>
                      </View>
                      <ProgressBar
                        progress={
                          skill.type === 'continuous'
                            ? (financeCheckin?.score ?? 0) / 100
                            : skill.xp / 100
                        }
                        color={skill.accent}
                        height={2}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.unassessedRow}>
                  <Text style={styles.unassessedText}>
                    {skill.type === 'continuous'
                      ? 'Complete a monthly check-in to calculate your Finance level.'
                      : 'Score the metrics to establish your true starting rank.'}
                  </Text>
                  <Pressable
                    onPress={() =>
                      skill.type === 'continuous' ? onOpenFinance() : onAssess(skill.id)
                    }
                    style={styles.assessButton}
                  >
                    <Text style={styles.assessText}>
                      {skill.type === 'continuous' ? 'Check in' : 'Assess'}
                    </Text>
                    <AppIcon name="arrow-right" size={11} color={colors.gold} />
                  </Pressable>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>
                  {skill.id === 'finance'
                    ? financeCheckin
                      ? `Latest: ${financeCheckin.month}`
                      : 'No check-ins yet'
                    : tracked
                      ? `${skill.xp} / 100 XP to next level`
                      : 'Baseline not set'}
                </Text>
                <AppIcon name="chevronRight" size={13} color={colors.faint} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          Practice XP moves you within a rank. Crossing a rank gate always requires a metric
          assessment.
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
  summaryCard: {
    marginTop: 16,
    padding: 14,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 8,
  },
  summaryFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  summaryFootText: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
  },
  list: {
    gap: 11,
  },
  skillCard: {
    borderRadius: 17,
    borderWidth: 1,
    backgroundColor: 'rgba(18,25,36,0.9)',
    padding: 13,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 2,
    borderRadius: 2,
    opacity: 0.65,
  },
  glow: {
    position: 'absolute',
    width: 90,
    height: 90,
    right: -42,
    top: -48,
    borderRadius: 45,
    opacity: 0.1,
  },
  skillHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skillInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  skillName: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.25,
  },
  skillMeta: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
    marginTop: 2,
  },
  levelBlock: {
    alignItems: 'flex-end',
  },
  level: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    lineHeight: 31,
    color: colors.text,
    letterSpacing: -0.8,
  },
  levelLabel: {
    fontFamily: fonts.medium,
    fontSize: 6.5,
    letterSpacing: 1,
    color: colors.faint,
  },
  rankLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  readyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  readyText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    color: colors.teal,
    letterSpacing: 0.3,
  },
  dueText: {
    fontFamily: fonts.medium,
    fontSize: 7.5,
    color: colors.violet,
    marginLeft: 'auto',
  },
  gateText: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
    marginLeft: 'auto',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  metric: {
    flex: 1,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: colors.faint,
  },
  metricValue: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: colors.muted,
  },
  unassessedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  unassessedText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.muted,
  },
  assessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  assessText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: colors.gold,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.055)',
  },
  cardFooterText: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
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
