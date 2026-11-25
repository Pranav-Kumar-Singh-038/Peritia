import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import {
  Card,
  GoldButton,
  IconBubble,
  OutlineButton,
  Pill,
  ProgressBar,
  RankChip,
  Screen,
  SectionHeader,
  TextField,
  TopBar,
} from '../components/ui';
import {
  computeWeightedScore,
  getRankGate,
  levelCeilingForRank,
  rankIndexForLevel,
  rankLabelForLevel,
} from '../logic/progression';
import { useApp, type AssessmentResult } from '../state/AppState';
import { colors, fonts } from '../theme';
import type { AssessmentMode, SkillId } from '../types';
import { formatPercent } from '../utils/format';

const MODE_COPY: Record<AssessmentMode, { title: string; body: string; action: string }> = {
  initial: {
    title: 'Baseline assessment',
    body: 'Score each metric honestly against the rubric. This becomes your real starting level — not zero.',
    action: 'Set my baseline',
  },
  reassessment: {
    title: 'Re-assessment',
    body: 'Record where you are today. A weaker demonstration can lower your level; practice never decays on its own.',
    action: 'Save assessment',
  },
  'rank-trial': {
    title: 'Rank trial',
    body: 'Demonstrate the next rank standard. All gate criteria must be met for the promotion to certify.',
    action: 'Submit rank trial',
  },
};

export function AssessmentScreen({
  skillId,
  mode,
  onBack,
}: {
  skillId: SkillId;
  mode: AssessmentMode;
  onBack: () => void;
}) {
  const { state, assessSkill } = useApp();
  const skill = state?.skills.find((item) => item.id === skillId);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    if (!skill) return {};
    const base: Record<string, number> = {};
    for (const metric of skill.metrics) {
      base[metric.key] = skill.scores?.[metric.key] ?? 50;
    }
    return base;
  });
  const [note, setNote] = useState('');
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!state || !skill) return null;
  const copy = MODE_COPY[mode];
  const weighted = computeWeightedScore(skill.metrics, scores);
  const currentRank = rankIndexForLevel(skill.level);
  const ceiling = levelCeilingForRank(currentRank);
  const projectedLevel = mode === 'initial' ? Math.round(weighted) : Math.min(Math.round(weighted), mode === 'reassessment' ? 100 : levelCeilingForRank(currentRank + 1));
  const projectedRank = rankIndexForLevel(projectedLevel);
  const gate = getRankGate(skill, state.metDemoKeys, scores);
  const gateMet = gate ? gate.criteria.filter((criterion) => criterion.met).length : 0;
  const atOrAboveGate = Math.round(weighted) > ceiling;

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    const outcome = assessSkill(skill.id, scores, mode, note.trim() || undefined);
    if (outcome) setResult(outcome);
    else setSubmitted(false);
  };

  if (result) {
    const positive = result.passedGate;
    return (
      <Screen bottomPadding={40}>
        <TopBar title="Assessment result" subtitle={skill.name} onBack={onBack} />
        <Card
          style={styles.resultCard}
          accent={positive ? colors.green : colors.rose}
        >
          <View
            style={[
              styles.resultIcon,
              {
                backgroundColor: positive ? colors.greenSoft : colors.roseSoft,
                borderColor: positive ? colors.greenBorder : colors.roseBorder,
              },
            ]}
          >
            <AppIcon
              name={positive ? (result.rankUp ? 'arrow-up' : 'check') : 'lock'}
              size={26}
              color={positive ? colors.green : colors.rose}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.resultKicker}>
            {positive ? (result.rankUp ? 'RANK PROMOTION' : 'ASSESSMENT CERTIFIED') : 'GATE HELD'}
          </Text>
          <Text style={styles.resultTitle}>
            {positive
              ? result.rankUp
                ? result.rankLabel
                : `${skill.name} · Level ${result.newLevel}`
              : 'Not enough to certify'}
          </Text>
          <Text style={styles.resultBody}>
            {positive
              ? result.rankUp
                ? `You proved the standard for ${result.rankLabel}. The new rank is now certified.`
                : `Your weighted score of ${Math.round(result.weightedScore)} has been recorded.`
              : result.gateNotes ?? 'Meet the remaining rank criteria, then try again.'}
          </Text>

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>WEIGHTED</Text>
              <Text style={styles.resultStatValue}>{Math.round(result.weightedScore)}</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>LEVEL</Text>
              <Text style={styles.resultStatValue}>{result.newLevel}</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>RANK</Text>
              <Text style={styles.resultStatValueSmall}>
                {rankLabelForLevel(result.newLevel, skill.id)}
              </Text>
            </View>
          </View>

          {result.rankUp ? (
            <View style={styles.resultBanner}>
              <AppIcon name="sparkles" size={13} color={colors.gold} />
              <Text style={styles.resultBannerText}>
                Rank {result.newRank + 1} of 10 unlocked. A new main quest is available.
              </Text>
            </View>
          ) : null}

          <GoldButton
            label="Continue"
            icon="arrow-right"
            onPress={onBack}
            style={{ marginTop: 18 }}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen bottomPadding={40}>
      <TopBar title={copy.title} subtitle={skill.name} onBack={onBack} />

      <Card style={styles.introCard} accent={skill.accent}>
        <View style={styles.introTop}>
          <IconBubble
            icon={skill.icon}
            size={42}
            iconSize={20}
            color={skill.accent}
            background={`${skill.accent}12`}
            border={`${skill.accent}28`}
          />
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>{copy.title}</Text>
            <Text style={styles.introBody}>{copy.body}</Text>
          </View>
        </View>
        <View style={styles.introMeta}>
          <RankChip label={rankLabelForLevel(skill.level, skill.id)} color={skill.accent} />
          <Text style={styles.introMetaText}>
            {mode === 'initial'
              ? 'No baseline yet'
              : `Current level ${skill.level} · certified ${skill.certifiedLevel}`}
          </Text>
        </View>
      </Card>

      <View style={styles.previewRow}>
        <View style={styles.previewBlock}>
          <Text style={styles.previewLabel}>LIVE WEIGHTED SCORE</Text>
          <Text style={[styles.previewValue, { color: skill.accent }]}>
            {Math.round(weighted)}
          </Text>
        </View>
        <View style={styles.previewDivider} />
        <View style={styles.previewBlock}>
          <Text style={styles.previewLabel}>PROJECTED LEVEL</Text>
          <Text style={styles.previewValue}>{projectedLevel}</Text>
        </View>
        <View style={styles.previewDivider} />
        <View style={styles.previewBlock}>
          <Text style={styles.previewLabel}>PROJECTED RANK</Text>
          <Text style={styles.previewValueSmall}>
            {rankLabelForLevel(projectedLevel, skill.id)}
          </Text>
        </View>
      </View>

      {mode === 'rank-trial' && gate ? (
        <View
          style={[
            styles.gateHint,
            gate.allMet && styles.gateHintReady,
          ]}
        >
          <AppIcon
            name={gate.allMet ? 'check-circle' : 'lock'}
            size={13}
            color={gate.allMet ? colors.teal : colors.gold}
          />
          <Text style={[styles.gateHintText, gate.allMet && { color: colors.teal }]}>
            {gate.allMet
              ? `All ${gate.criteria.length} gate criteria are met with these scores.`
              : `${gateMet}/${gate.criteria.length} gate criteria met. Unmet criteria will hold the rank.`}
          </Text>
        </View>
      ) : null}

      <SectionHeader
        title="Metric rubric"
        note="0–100 · slide to score"
      />

      <View style={styles.metricList}>
        {skill.metrics.map((metric) => {
          const value = scores[metric.key] ?? 50;
          const rubric =
            value < 40 ? metric.rubric.low : value < 70 ? metric.rubric.mid : metric.rubric.high;
          const isKey = skill.keyMetrics.includes(metric.key);
          return (
            <Card key={metric.key} style={styles.metricCard}>
              <View style={styles.metricHead}>
                <View style={styles.metricTitleRow}>
                  <Text style={styles.metricName}>{metric.label}</Text>
                  {isKey ? (
                    <Pill
                      label="KEY"
                      color={skill.accent}
                      background={`${skill.accent}12`}
                      border={`${skill.accent}2c`}
                    />
                  ) : null}
                </View>
                <Text style={[styles.metricValue, { color: skill.accent }]}>
                  {Math.round(value)}
                </Text>
              </View>
              <Text style={styles.metricDesc}>{metric.description}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={value}
                onValueChange={(next) =>
                  setScores((current) => ({ ...current, [metric.key]: Math.round(next) }))
                }
                minimumTrackTintColor={skill.accent}
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor={skill.accent}
              />
              <View style={styles.sliderScale}>
                <Text style={styles.sliderScaleText}>0</Text>
                <Text style={styles.sliderScaleText}>50</Text>
                <Text style={styles.sliderScaleText}>100</Text>
              </View>
              <View style={styles.rubricBox}>
                <Text style={styles.rubricLabel}>
                  {value < 40 ? 'DEVELOPING' : value < 70 ? 'CAPABLE' : 'PROFICIENT'}
                </Text>
                <Text style={styles.rubricText}>{rubric}</Text>
              </View>
              <Text style={styles.weightText}>
                Weight {formatPercent(metric.weight * 100)}
              </Text>
            </Card>
          );
        })}
      </View>

      <SectionHeader title="Notes" note="Optional" />
      <TextField
        value={note}
        onChangeText={setNote}
        placeholder="What did you demonstrate? Any context for future you?"
        multiline
        maxLength={400}
      />

      {mode === 'reassessment' && atOrAboveGate && gate && !gate.allMet ? (
        <View style={styles.warningBox}>
          <AppIcon name="alert-triangle" size={13} color={colors.rose} />
          <Text style={styles.warningText}>
            This score would cross into {gate.targetRankName}, but the rank gate is not met.
            Your level will be capped at {ceiling}.
          </Text>
        </View>
      ) : null}

      <GoldButton
        label={copy.action}
        icon={mode === 'rank-trial' ? 'arrow-up' : 'check'}
        onPress={submit}
        disabled={submitted}
        style={{ marginTop: 4 }}
      />
      <OutlineButton
        label="Cancel"
        onPress={onBack}
        style={{ marginTop: 9 }}
      />

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          Self-assessment is trust-based. Score what you can actually do today, not what you hope
          to do next month.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  introCard: {
    padding: 14,
  },
  introTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  introCopy: {
    flex: 1,
  },
  introTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.25,
  },
  introBody: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 15,
    color: colors.muted,
    marginTop: 3,
  },
  introMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  introMetaText: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 12,
    padding: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,25,36,0.78)',
  },
  previewBlock: {
    flex: 1,
    minWidth: 0,
  },
  previewDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 9,
  },
  previewLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: colors.faint,
  },
  previewValue: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 27,
    color: colors.text,
    marginTop: 2,
  },
  previewValueSmall: {
    fontFamily: fonts.medium,
    fontSize: 9,
    lineHeight: 13,
    color: colors.text,
    marginTop: 4,
  },
  gateHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  gateHintReady: {
    borderColor: colors.tealBorder,
    backgroundColor: colors.tealSoft,
  },
  gateHintText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: colors.gold2,
  },
  metricList: {
    gap: 11,
  },
  metricCard: {
    padding: 13,
  },
  metricHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  metricName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
    letterSpacing: -0.15,
  },
  metricValue: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.6,
  },
  metricDesc: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.faint,
    marginTop: 3,
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: 7,
  },
  sliderScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    paddingHorizontal: 3,
  },
  sliderScaleText: {
    fontFamily: fonts.regular,
    fontSize: 7,
    color: colors.faint,
  },
  rubricBox: {
    marginTop: 9,
    padding: 9,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.028)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rubricLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 1.1,
    color: colors.gold,
    marginBottom: 3,
  },
  rubricText: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.muted,
  },
  weightText: {
    fontFamily: fonts.regular,
    fontSize: 7,
    color: colors.faint,
    marginTop: 6,
    textAlign: 'right',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.roseBorder,
    backgroundColor: colors.roseSoft,
  },
  warningText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: colors.rose,
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
  resultCard: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  resultIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultKicker: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    letterSpacing: 1.6,
    color: colors.faint,
    marginTop: 14,
  },
  resultTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 29,
    lineHeight: 33,
    letterSpacing: -0.9,
    color: colors.text,
    textAlign: 'center',
    marginTop: 5,
  },
  resultBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 290,
  },
  resultStats: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 0.9,
    color: colors.faint,
  },
  resultStatValue: {
    fontFamily: fonts.displayBold,
    fontSize: 23,
    color: colors.text,
    marginTop: 2,
  },
  resultStatValueSmall: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.text,
    marginTop: 5,
    textAlign: 'center',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: '100%',
    marginTop: 15,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  resultBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: colors.gold2,
  },
});
