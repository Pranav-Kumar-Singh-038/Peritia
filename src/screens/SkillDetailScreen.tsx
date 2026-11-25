import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import {
  Card,
  GoldButton,
  IconBubble,
  InfoRow,
  OutlineButton,
  Pill,
  ProgressBar,
  RankChip,
  Screen,
  SectionHeader,
  TopBar,
} from '../components/ui';
import {
  computeWeightedScore,
  getRankGate,
  levelCeilingForRank,
  mainQuestForSkill,
  rankIndexForLevel,
  rankLabelForLevel,
} from '../logic/progression';
import { useApp } from '../state/AppState';
import { colors, fonts, radii } from '../theme';
import type { AssessmentMode, SkillId } from '../types';
import { formatDate, relativeDate } from '../utils/date';

export function SkillDetailScreen({
  skillId,
  onBack,
  onAssess,
}: {
  skillId: SkillId;
  onBack: () => void;
  onAssess: (mode: AssessmentMode) => void;
}) {
  const { state, startMainQuest } = useApp();
  if (!state) return null;
  const skill = state.skills.find((item) => item.id === skillId);
  if (!skill) return null;
  const tracked = skill.assessedAt !== null;
  const gate = getRankGate(skill, state.metDemoKeys);
  const weighted = computeWeightedScore(skill.metrics, skill.scores);
  const currentRank = rankIndexForLevel(skill.level);
  const ceiling = levelCeilingForRank(currentRank);
  const atCeiling = tracked && skill.level >= ceiling;
  const rankLabel = rankLabelForLevel(skill.level, skill.id);
  const mainQuest = mainQuestForSkill(skill);
  const activeMain = state.activeQuests.find((quest) => quest.kind === 'main');
  const demoIsActive = Boolean(
    gate && activeMain && activeMain.demoKey === gate.demoKey,
  );
  const assessments = state.assessments.filter((item) => item.skillId === skill.id).slice(0, 5);
  const progress = atCeiling ? 1 : skill.xp / 100;
  const nextGateLabel = gate ? `${gate.targetRankName} · ${gate.targetLevel}` : 'Max rank';

  return (
    <Screen bottomPadding={36}>
      <TopBar
        title={skill.name}
        subtitle={`${skill.category} · ${skill.type === 'continuous' ? 'Continuous metrics' : 'Metric assessment'}`}
        onBack={onBack}
        right={<RankChip label={tracked ? rankLabel : 'Unassessed'} color={skill.accent} />}
      />

      <LinearGradient
        colors={[`${skill.accent}22`, 'rgba(18,25,36,0.96) 52%', 'rgba(14,20,29,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { borderColor: `${skill.accent}33` }]}
      >
        <View style={[styles.heroGlow, { backgroundColor: skill.accent }]} />
        <View style={styles.heroTop}>
          <IconBubble
            icon={skill.icon}
            size={52}
            iconSize={24}
            color={skill.accent}
            background={`${skill.accent}12`}
            border={`${skill.accent}28`}
          />
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{skill.name}</Text>
            <Text style={styles.heroDesc}>{skill.description}</Text>
          </View>
          <View style={styles.levelBlock}>
            <Text style={[styles.levelNumber, { color: skill.accent }]}>
              {tracked ? skill.level : '—'}
            </Text>
            <Text style={styles.levelLabel}>{tracked ? 'LEVEL' : 'UNSET'}</Text>
          </View>
        </View>

        {tracked ? (
          <>
            <View style={styles.rankRow}>
              <RankChip label={rankLabel} color={skill.accent} />
              <Text style={styles.rankMeta}>
                Certified {skill.certifiedLevel}
                {skill.certifiedLevel !== skill.level ? ` · practice ${skill.level}` : ''}
              </Text>
              <Text style={styles.assessedMeta}>
                {skill.assessedAt ? `Assessed ${relativeDate(skill.assessedAt)}` : ''}
              </Text>
            </View>
            <View style={styles.progressTop}>
              <Text style={styles.progressLabel}>
                {atCeiling
                  ? gate?.allMet
                    ? 'Rank gate ready'
                    : 'Rank gate required to advance'
                  : `${skill.xp} / 100 XP to next level`}
              </Text>
              <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
            </View>
            <ProgressBar progress={progress} color={skill.accent} height={4} />
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>WEIGHTED SCORE</Text>
                <Text style={styles.statValue}>{Math.round(weighted)}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>NEXT GATE</Text>
                <Text style={styles.statValueSmall}>{nextGateLabel}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>CRITERIA</Text>
                <Text style={styles.statValueSmall}>
                  {gate ? `${gate.criteria.filter((c) => c.met).length}/${gate.criteria.length} met` : 'Max'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.unassessedHero}>
            <Text style={styles.unassessedTitle}>No baseline yet</Text>
            <Text style={styles.unassessedBody}>
              Score each metric once. The weighted result becomes your real starting level and
              rank — no grinding from zero.
            </Text>
          </View>
        )}

        <View style={styles.heroActions}>
          {!tracked ? (
            <GoldButton
              label="Take baseline assessment"
              icon="scan"
              onPress={() => onAssess('initial')}
              style={{ flex: 1 }}
            />
          ) : gate?.allMet ? (
            <>
              <OutlineButton
                label="Re-assess"
                icon="refresh"
                onPress={() => onAssess('reassessment')}
                style={{ flex: 1 }}
              />
              <GoldButton
                label="Rank trial"
                icon="arrow-up"
                onPress={() => onAssess('rank-trial')}
                style={{ flex: 1 }}
              />
            </>
          ) : (
            <GoldButton
              label="Re-assess metrics"
              icon="refresh"
              onPress={() => onAssess('reassessment')}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </LinearGradient>

      {atCeiling && gate && !gate.allMet ? (
        <View style={styles.holdBanner}>
          <AppIcon name="lock" size={13} color={colors.gold} />
          <Text style={styles.holdText}>
            Practice XP is capped at {ceiling}. Meet the rank gate to keep climbing.
          </Text>
        </View>
      ) : null}

      <SectionHeader
        title="Metric profile"
        note={tracked ? `Weighted ${Math.round(weighted)} / 100` : 'Not assessed'}
      />
      <Card style={styles.metricsCard}>
        {skill.metrics.map((metric, index) => {
          const score = skill.scores?.[metric.key] ?? 0;
          const rubric =
            score < 40 ? metric.rubric.low : score < 70 ? metric.rubric.mid : metric.rubric.high;
          return (
            <View
              key={metric.key}
              style={[styles.metricRow, index === skill.metrics.length - 1 && styles.metricRowLast]}
            >
              <View style={styles.metricHead}>
                <View style={styles.metricTitleRow}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  {skill.keyMetrics.includes(metric.key) ? (
                    <Pill label="KEY" color={skill.accent} background={`${skill.accent}12`} border={`${skill.accent}2c`} />
                  ) : null}
                </View>
                <Text style={[styles.metricScore, { color: tracked ? skill.accent : colors.faint }]}>
                  {tracked ? Math.round(score) : '—'}
                </Text>
              </View>
              <ProgressBar
                progress={tracked ? score / 100 : 0}
                color={skill.accent}
                height={3}
              />
              <View style={styles.metricFoot}>
                <Text style={styles.metricDesc} numberOfLines={2}>
                  {metric.description}
                </Text>
                <Text style={styles.metricWeight}>{Math.round(metric.weight * 100)}%</Text>
              </View>
              {tracked ? (
                <Text style={styles.rubric} numberOfLines={2}>
                  {rubric}
                </Text>
              ) : null}
            </View>
          );
        })}
      </Card>

      {gate ? (
        <>
          <SectionHeader
            title="Next rank gate"
            note={gate.targetRankName}
            action={gate.allMet ? 'Rank trial' : undefined}
            onAction={gate.allMet ? () => onAssess('rank-trial') : undefined}
          />
          <Card style={styles.gateCard} accent={gate.allMet ? colors.teal : colors.gold}>
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
                    <Text style={[styles.criterionTitle, criterion.met && styles.criterionTitleMet]}>
                      {criterion.title}
                    </Text>
                    <Text style={styles.criterionDesc}>{criterion.description}</Text>
                    {criterion.type === 'demonstration' && !criterion.met ? (
                      <Pressable
                        onPress={() => {
                          if (mainQuest) startMainQuest(mainQuest);
                        }}
                        style={styles.mainQuestLink}
                      >
                        <AppIcon name={demoIsActive ? 'check-circle' : 'target'} size={10} color={colors.gold} />
                        <Text style={styles.mainQuestLinkText}>
                          {demoIsActive ? 'Main quest active' : 'Set as main quest'}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
            {gate.allMet ? (
              <GoldButton
                label={`Start rank trial for ${gate.targetRankName}`}
                icon="arrow-up"
                onPress={() => onAssess('rank-trial')}
                style={{ marginTop: 13 }}
              />
            ) : null}
          </Card>
        </>
      ) : (
        <Card style={styles.maxCard}>
          <IconBubble icon="crown" size={38} iconSize={18} color={colors.gold} />
          <Text style={styles.maxTitle}>Grandmaster</Text>
          <Text style={styles.maxBody}>
            You have reached the top of the rank ladder. Keep practicing to refine level 100.
          </Text>
        </Card>
      )}

      <SectionHeader title="Assessment history" note={`${assessments.length} recent`} />
      <Card style={styles.historyCard}>
        {assessments.length ? (
          assessments.map((assessment, index) => (
            <View
              key={assessment.id}
              style={[styles.historyRow, index === assessments.length - 1 && styles.historyRowLast]}
            >
              <View
                style={[
                  styles.historyIcon,
                  {
                    backgroundColor: assessment.passedGate
                      ? colors.greenSoft
                      : colors.roseSoft,
                  },
                ]}
              >
                <AppIcon
                  name={assessment.passedGate ? 'trending-up' : 'alert-triangle'}
                  size={13}
                  color={assessment.passedGate ? colors.green : colors.rose}
                />
              </View>
              <View style={styles.historyCopy}>
                <Text style={styles.historyTitle}>
                  {assessment.mode === 'initial'
                    ? 'Baseline assessment'
                    : assessment.mode === 'rank-trial'
                      ? 'Rank trial'
                      : 'Re-assessment'}
                </Text>
                <Text style={styles.historyMeta}>
                  {formatDate(assessment.createdAt, 'short')} · score{' '}
                  {Math.round(assessment.weightedScore)} · level {assessment.newLevel}
                </Text>
              </View>
              <Pill
                label={assessment.passedGate ? (assessment.newRank > assessment.previousRank ? 'RANK UP' : 'PASSED') : 'HELD'}
                color={assessment.passedGate ? colors.green : colors.rose}
                background={assessment.passedGate ? colors.greenSoft : colors.roseSoft}
                border={assessment.passedGate ? colors.greenBorder : colors.roseBorder}
              />
            </View>
          ))
        ) : (
          <View style={styles.historyEmpty}>
            <Text style={styles.historyEmptyText}>
              No assessments yet. Your baseline will appear here.
            </Text>
          </View>
        )}
      </Card>

      <SectionHeader title="Details" />
      <Card style={styles.detailsCard}>
        <InfoRow label="Category" value={skill.category} />
        <InfoRow label="Type" value="Assessed skill" />
        <InfoRow label="Metrics" value={`${skill.metrics.length}`} />
        <InfoRow label="Key metrics" value={skill.keyMetrics.map((key) => skill.metrics.find((m) => m.key === key)?.short ?? key).join(' · ')} />
        <InfoRow
          label="Last assessed"
          value={skill.assessedAt ? formatDate(skill.assessedAt, 'medium') : 'Never'}
        />
      </Card>

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          A re-assessment can lower your level if you record a weaker demonstration. Practice
          never decays on its own in v1.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 15,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    right: -70,
    top: -80,
    borderRadius: 75,
    opacity: 0.14,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  heroInfo: {
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
  levelNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 39,
    lineHeight: 38,
    letterSpacing: -1.5,
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
    fontSize: 8.5,
    color: colors.muted,
  },
  assessedMeta: {
    marginLeft: 'auto',
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
  },
  progressPercent: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: colors.muted,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 0.9,
    color: colors.faint,
  },
  statValue: {
    fontFamily: fonts.displayBold,
    fontSize: 19,
    color: colors.text,
    marginTop: 2,
  },
  statValueSmall: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.text,
    marginTop: 3,
  },
  unassessedHero: {
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
  heroActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },
  holdBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  holdText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.gold2,
  },
  metricsCard: {
    paddingHorizontal: 13,
  },
  metricRow: {
    paddingVertical: 12,
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
    marginBottom: 7,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  metricScore: {
    fontFamily: fonts.displayBold,
    fontSize: 19,
    lineHeight: 21,
  },
  metricFoot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
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
  rubric: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.muted,
    marginTop: 6,
    fontStyle: 'italic',
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
  mainQuestLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  mainQuestLinkText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    color: colors.gold,
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
    paddingHorizontal: 13,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  historyIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCopy: {
    flex: 1,
  },
  historyTitle: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.text,
  },
  historyMeta: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    marginTop: 2,
  },
  historyEmpty: {
    paddingVertical: 18,
  },
  historyEmptyText: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: colors.faint,
    textAlign: 'center',
  },
  detailsCard: {
    paddingHorizontal: 13,
    paddingVertical: 3,
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
