import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import {
  Card,
  EmptyState,
  GoldButton,
  IconBubble,
  InfoRow,
  Pill,
  ProgressBar,
  RankChip,
  Screen,
  SectionHeader,
  TopBar,
} from '../components/ui';
import {
  FINANCE_LADDER,
  financeMetricsFromCheckin,
  getFinanceGate,
} from '../logic/finance';
import {
  levelCeilingForRank,
  rankIndexForLevel,
  rankLabelForLevel,
} from '../logic/progression';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';
import { monthKey, monthLabel, relativeDate, shortMonth } from '../utils/date';
import { formatMoney, formatPercent, toRoman } from '../utils/format';

export function FinanceDetailScreen({
  onBack,
  onCheckin,
}: {
  onBack: () => void;
  onCheckin: () => void;
}) {
  const { state } = useApp();
  if (!state) return null;
  const skill = state.skills.find((item) => item.id === 'finance');
  if (!skill) return null;

  const sorted = [...state.financeCheckins].sort((a, b) => b.month.localeCompare(a.month));
  const latest = sorted[0] ?? null;
  const history = [...sorted].slice(0, 6).reverse();
  const metricScores = financeMetricsFromCheckin(latest);
  const gate = getFinanceGate(skill, latest);
  const rank = rankIndexForLevel(skill.level);
  const ceiling = levelCeilingForRank(rank);
  const withinRank = skill.level % 10;
  const nextRankName =
    rank < 9 ? `${FINANCE_LADDER[rank + 1].rank} ${toRoman(rank + 2)}` : 'Grandmaster';
  const currentMonth = monthKey();
  const hasCurrentMonth = latest?.month === currentMonth;
  const ctaLabel = hasCurrentMonth
    ? `Update ${monthLabel(currentMonth)} check-in`
    : `Log ${monthLabel(currentMonth)} check-in`;
  const monthly = latest?.score ?? 0;

  return (
    <Screen bottomPadding={40}>
      <TopBar
        title="Finance"
        subtitle="Monthly metrics · continuous skill"
        onBack={onBack}
        right={<RankChip label={latest ? rankLabelForLevel(skill.level, 'finance') : 'Unassessed'} color={skill.accent} />}
      />

      <LinearGradient
        colors={['rgba(94,234,212,0.18)', 'rgba(18,25,36,0.96) 50%', 'rgba(14,20,29,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} />
        <View style={styles.heroTop}>
          <IconBubble
            icon="wallet"
            size={52}
            iconSize={24}
            color={skill.accent}
            background={colors.tealSoft}
            border={colors.tealBorder}
          />
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>Finance</Text>
            <Text style={styles.heroDesc}>
              Income, savings, resilience, and the freedom to choose your work.
            </Text>
          </View>
          <View style={styles.levelBlock}>
            <Text style={styles.level}>{latest ? skill.level : '—'}</Text>
            <Text style={styles.levelLabel}>{latest ? 'LEVEL' : 'UNSET'}</Text>
          </View>
        </View>

        {latest ? (
          <>
            <View style={styles.rankRow}>
              <RankChip label={rankLabelForLevel(skill.level, 'finance')} color={skill.accent} />
              <Text style={styles.rankMeta}>
                {latest ? `Updated ${relativeDate(latest.createdAt)}` : 'No check-ins'}
              </Text>
              <Text style={styles.rankScore}>Score {monthly}</Text>
            </View>
            <View style={styles.progressTop}>
              <Text style={styles.progressLabel}>
                {gate?.allMet
                  ? `Rank trial ready · ${gate.targetRankName}`
                  : `${withinRank} / 10 levels into ${FINANCE_LADDER[rank].rank}`}
              </Text>
              <Text style={styles.progressPercent}>
                {gate && !gate.allMet && skill.level >= ceiling
                  ? 'GATE HELD'
                  : `Next ${nextRankName}`}
              </Text>
            </View>
            <ProgressBar
              progress={skill.level >= ceiling ? 1 : withinRank / 10}
              color={skill.accent}
              height={4}
            />
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>WEIGHTED SCORE</Text>
                <Text style={styles.heroStatValue}>{Math.round(skill.scores ? monthly : 0)}</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>SAVINGS RATE</Text>
                <Text style={styles.heroStatValue}>
                  {formatPercent(latest.savingsRate * 100, 1)}
                </Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>EMERGENCY FUND</Text>
                <Text style={styles.heroStatValue}>{latest.emergencyMonths.toFixed(1)} mo</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.unassessed}>
            <Text style={styles.unassessedTitle}>Your ledger is empty</Text>
            <Text style={styles.unassessedBody}>
              Finance is measured monthly, not by practice XP. Record income, expenses, and
              resilience once a month to establish your level.
            </Text>
          </View>
        )}

        <GoldButton
          label={ctaLabel}
          icon="calendar-check"
          onPress={onCheckin}
          style={{ marginTop: 14 }}
        />
      </LinearGradient>

      {latest ? (
        <>
          <SectionHeader
            title="Metric profile"
            note={`${latest.month} · weighted ${monthly}`}
          />
          <Card style={styles.metricsCard}>
            {skill.metrics.map((metric, index) => {
              const value = metricScores[metric.key] ?? 0;
              return (
                <View
                  key={metric.key}
                  style={[
                    styles.metricRow,
                    index === skill.metrics.length - 1 && styles.metricRowLast,
                  ]}
                >
                  <View style={styles.metricHead}>
                    <View style={styles.metricTitleRow}>
                      <Text style={styles.metricName}>{metric.label}</Text>
                      {skill.keyMetrics.includes(metric.key) ? (
                        <Pill
                          label="KEY"
                          color={skill.accent}
                          background={colors.tealSoft}
                          border={colors.tealBorder}
                        />
                      ) : null}
                    </View>
                    <Text style={styles.metricValue}>{Math.round(value)}</Text>
                  </View>
                  <ProgressBar progress={value / 100} color={skill.accent} height={3} />
                  <View style={styles.metricFoot}>
                    <Text style={styles.metricDesc} numberOfLines={2}>
                      {metric.description}
                    </Text>
                    <Text style={styles.metricWeight}>{Math.round(metric.weight * 100)}%</Text>
                  </View>
                </View>
              );
            })}
          </Card>

          <SectionHeader title="Latest snapshot" note={monthLabel(latest.month)} />
          <Card style={styles.snapshotCard}>
            <InfoRow label="Monthly income" value={formatMoney(latest.income, state.settings.currency)} />
            <InfoRow label="Monthly expenses" value={formatMoney(latest.expenses, state.settings.currency)} />
            <InfoRow
              label="Monthly surplus"
              value={formatMoney(latest.income - latest.expenses, state.settings.currency)}
              color={latest.income - latest.expenses >= 0 ? colors.green : colors.rose}
            />
            <InfoRow label="Net worth" value={formatMoney(latest.netWorth, state.settings.currency)} />
            <InfoRow label="Passive income" value={formatMoney(latest.passiveIncome, state.settings.currency)} />
            <InfoRow label="Runway" value={`${latest.runwayYears.toFixed(1)} years`} />
            <InfoRow
              label="Debt-to-income"
              value={formatPercent(latest.debtToIncome * 100, 1)}
              color={latest.debtToIncome <= 0.35 ? colors.green : colors.gold}
            />
          </Card>

          {gate ? (
            <>
              <SectionHeader
                title="Next rank gate"
                note={gate.targetRankName}
                action={gate.allMet ? 'Check in' : undefined}
                onAction={gate.allMet ? onCheckin : undefined}
              />
              <Card
                style={styles.gateCard}
                accent={gate.allMet ? colors.teal : colors.gold}
              >
                <View style={styles.gateHead}>
                  <View>
                    <Text style={styles.gateTitle}>{gate.targetRankName}</Text>
                    <Text style={styles.gateSub}>
                      Level {gate.targetLevel} · {gate.criteria.filter((c) => c.met).length} of{' '}
                      {gate.criteria.length} criteria met
                    </Text>
                  </View>
                  <View style={[styles.gateBadge, gate.allMet && styles.gateBadgeReady]}>
                    <AppIcon
                      name={gate.allMet ? 'check' : 'lock'}
                      size={13}
                      color={gate.allMet ? colors.teal : colors.gold}
                    />
                  </View>
                </View>
                <View style={styles.criteriaList}>
                  {gate.criteria.map((criterion) => (
                    <View key={criterion.key} style={styles.criterion}>
                      <View
                        style={[
                          styles.criterionCheck,
                          criterion.met && styles.criterionCheckMet,
                        ]}
                      >
                        {criterion.met ? (
                          <AppIcon name="check" size={9} color="#0c1a15" strokeWidth={2.6} />
                        ) : (
                          <View style={styles.criterionDot} />
                        )}
                      </View>
                      <View style={styles.criterionCopy}>
                        <Text
                          style={[
                            styles.criterionTitle,
                            criterion.met && styles.criterionTitleMet,
                          ]}
                        >
                          {criterion.title}
                        </Text>
                        <Text style={styles.criterionDesc}>{criterion.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                {gate.allMet ? (
                  <View style={styles.readyBanner}>
                    <AppIcon name="sparkles" size={13} color={colors.gold} />
                    <Text style={styles.readyText}>
                      Your next monthly check-in can promote you to {gate.targetRankName}.
                    </Text>
                  </View>
                ) : null}
              </Card>
            </>
          ) : (
            <Card style={styles.maxCard}>
              <IconBubble icon="crown" size={38} iconSize={18} color={colors.gold} />
              <Text style={styles.maxTitle}>Abundance</Text>
              <Text style={styles.maxBody}>
                You have reached the top of the finance ladder. Keep the system steady.
              </Text>
            </Card>
          )}

          <SectionHeader title="Score history" note={`${sorted.length} check-ins`} />
          <Card style={styles.historyCard}>
            <View style={styles.historyChart}>
              {history.map((checkin) => (
                <View key={checkin.id} style={styles.historyColumn}>
                  <Text style={styles.historyValue}>{checkin.score}</Text>
                  <View style={styles.historyTrack}>
                    <LinearGradient
                      colors={[skill.accent, colors.tealBorder]}
                      style={[
                        styles.historyBar,
                        { height: `${Math.max(5, Math.min(100, checkin.score))}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.historyMonth}>{shortMonth(checkin.month)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.historyFoot}>
              <Text style={styles.historyFootText}>
                Latest level {latest.level} · score {latest.score}
              </Text>
              <Text style={styles.historyFootText}>
                {latest.emergencyMonths.toFixed(1)} months of runway
              </Text>
            </View>
          </Card>
        </>
      ) : (
        <Card style={styles.emptyCard}>
          <EmptyState
            icon="wallet"
            title="No monthly check-ins yet"
            body="Finance uses weighted monthly metrics and rank thresholds. One honest check-in sets your baseline."
            action="Log my first month"
            onAction={onCheckin}
          />
        </Card>
      )}

      <SectionHeader title="Rank ladder" note="10 ranks · monthly gates" />
      <Card style={styles.ladderCard}>
        {FINANCE_LADDER.map((entry, index) => {
          const isCurrent = index === rank;
          const done = index < rank;
          const locked = index > rank;
          return (
            <View
              key={entry.rank}
              style={[
                styles.ladderRow,
                isCurrent && styles.ladderRowCurrent,
                index === FINANCE_LADDER.length - 1 && styles.ladderRowLast,
              ]}
            >
              <View
                style={[
                  styles.ladderDot,
                  done && styles.ladderDotDone,
                  isCurrent && styles.ladderDotCurrent,
                ]}
              >
                {done ? (
                  <AppIcon name="check" size={8} color="#0c1a15" strokeWidth={2.6} />
                ) : (
                  <Text style={[styles.ladderDotText, isCurrent && { color: '#0c1a15' }]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <View style={styles.ladderCopy}>
                <View style={styles.ladderTitleRow}>
                  <Text
                    style={[
                      styles.ladderTitle,
                      isCurrent && styles.ladderTitleCurrent,
                      locked && styles.ladderTitleLocked,
                    ]}
                  >
                    {entry.rank} {toRoman(index + 1)}
                  </Text>
                  {isCurrent ? (
                    <Pill
                      label="YOU ARE HERE"
                      color={colors.gold}
                      background={colors.goldSoft}
                      border={colors.goldBorder}
                    />
                  ) : null}
                </View>
                <Text style={styles.ladderGate}>{entry.gate}</Text>
              </View>
              <Text style={[styles.ladderRange, isCurrent && { color: colors.gold2 }]}>
                {entry.range}
              </Text>
            </View>
          );
        })}
      </Card>

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          Finance does not use practice XP. Only a monthly metric check-in can change your level,
          and promotions require both the score and the rank threshold.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    padding: 15,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    right: -80,
    top: -90,
    borderRadius: 85,
    backgroundColor: colors.teal,
    opacity: 0.12,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroName: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: colors.text,
  },
  heroDesc: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14.5,
    color: colors.muted,
    marginTop: 3,
  },
  levelBlock: {
    alignItems: 'flex-end',
    paddingLeft: 4,
  },
  level: {
    fontFamily: fonts.displayBold,
    fontSize: 39,
    lineHeight: 38,
    letterSpacing: -1.5,
    color: colors.teal,
  },
  levelLabel: {
    fontFamily: fonts.medium,
    fontSize: 6.5,
    letterSpacing: 1.2,
    color: colors.faint,
    marginTop: 3,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 13,
  },
  rankMeta: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
  },
  rankScore: {
    marginLeft: 'auto',
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: colors.muted,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
    flex: 1,
  },
  progressPercent: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    letterSpacing: 0.3,
    color: colors.teal,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  heroStat: {
    flex: 1,
  },
  heroStatLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: colors.faint,
  },
  heroStatValue: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    marginTop: 2,
  },
  unassessed: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  unassessedTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  unassessedBody: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15.5,
    color: colors.muted,
    marginTop: 3,
  },
  metricsCard: {
    paddingHorizontal: 13,
  },
  metricRow: {
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  metricRowLast: {
    borderBottomWidth: 0,
  },
  metricHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  metricName: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  metricValue: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.teal,
  },
  metricFoot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 5,
  },
  metricDesc: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.faint,
  },
  metricWeight: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: colors.muted,
  },
  snapshotCard: {
    paddingHorizontal: 13,
    paddingVertical: 3,
  },
  gateCard: {
    padding: 13,
  },
  gateHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gateTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  gateSub: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
    marginTop: 2,
  },
  gateBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateBadgeReady: {
    borderColor: colors.tealBorder,
    backgroundColor: colors.tealSoft,
  },
  criteriaList: {
    gap: 10,
  },
  criterion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  criterionCheck: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  criterionCheckMet: {
    borderColor: colors.teal,
    backgroundColor: colors.teal,
  },
  criterionDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.faint,
  },
  criterionCopy: {
    flex: 1,
  },
  criterionTitle: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  criterionTitleMet: {
    color: colors.text,
  },
  criterionDesc: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 1,
  },
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    padding: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  readyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13.5,
    color: colors.gold2,
  },
  maxCard: {
    alignItems: 'center',
    padding: 22,
  },
  maxTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.gold2,
    marginTop: 10,
  },
  maxBody: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  historyCard: {
    padding: 13,
  },
  historyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 7,
    paddingTop: 6,
  },
  historyColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  historyValue: {
    fontFamily: fonts.medium,
    fontSize: 7.5,
    color: colors.muted,
    marginBottom: 3,
  },
  historyTrack: {
    flex: 1,
    width: '100%',
    maxWidth: 26,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.045)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  historyBar: {
    width: '100%',
    borderRadius: 5,
  },
  historyMonth: {
    fontFamily: fonts.medium,
    fontSize: 7,
    color: colors.faint,
    marginTop: 4,
  },
  historyFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  historyFootText: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
  },
  emptyCard: {
    padding: 2,
  },
  ladderCard: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  ladderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.055)',
  },
  ladderRowCurrent: {
    backgroundColor: 'rgba(94,234,212,0.045)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  ladderRowLast: {
    borderBottomWidth: 0,
  },
  ladderDot: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ladderDotDone: {
    borderColor: colors.teal,
    backgroundColor: colors.teal,
  },
  ladderDotCurrent: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  ladderDotText: {
    fontFamily: fonts.semibold,
    fontSize: 7,
    color: colors.faint,
  },
  ladderCopy: {
    flex: 1,
  },
  ladderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  ladderTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.text,
  },
  ladderTitleCurrent: {
    color: colors.gold2,
  },
  ladderTitleLocked: {
    color: colors.muted,
  },
  ladderGate: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 1,
  },
  ladderRange: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: colors.faint,
    marginTop: 2,
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
