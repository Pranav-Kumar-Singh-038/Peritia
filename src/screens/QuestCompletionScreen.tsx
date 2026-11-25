import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import {
  Card,
  EmptyState,
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
import { rankLabelForLevel, skillById } from '../logic/progression';
import { useApp, type QuestActionResult } from '../state/AppState';
import { colors, difficultyColor, difficultyLabel, fonts } from '../theme';

export function QuestCompletionScreen({
  activeId,
  onBack,
  onDone,
}: {
  activeId: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const { state, completeQuest } = useApp();
  const active = state?.activeQuests.find((quest) => quest.id === activeId) ?? null;
  const [notes, setNotes] = useState('');
  const [evidence, setEvidence] = useState('');
  const [result, setResult] = useState<QuestActionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!state) return null;
  if (!active) {
    return (
      <Screen bottomPadding={40}>
        <TopBar title="Quest" onBack={onBack} />
        <Card style={{ padding: 4 }}>
          <EmptyState
            icon="target"
            title="Quest not found"
            body="This quest may have been cleared or completed already."
            action="Back to quests"
            onAction={onBack}
          />
        </Card>
      </Screen>
    );
  }

  const skill = skillById(state, active.skillId);
  const nextStep = Math.min(active.progress + 1, active.targetCount);
  const isMultiStep = active.targetCount > 1;
  const actionLabel = isMultiStep
    ? `Log attempt ${nextStep} of ${active.targetCount}`
    : active.xp > 0
      ? 'Complete quest'
      : 'Log milestone';

  const submit = () => {
    if (submitting) return;
    setSubmitting(true);
    const outcome = completeQuest(active.id, notes.trim() || undefined, evidence.trim() || undefined);
    if (outcome) setResult(outcome);
    else setSubmitting(false);
  };

  if (result) {
    const finished = result.completed;
    return (
      <Screen bottomPadding={40}>
        <TopBar
          title={finished ? 'Quest complete' : 'Attempt logged'}
          subtitle={skill.name}
          onBack={finished ? onDone : onBack}
        />
        <Card
          style={styles.resultCard}
          accent={result.rankTrialReady ? colors.teal : colors.gold}
        >
          <View
            style={[
              styles.resultIcon,
              {
                backgroundColor: result.rankTrialReady ? colors.tealSoft : colors.goldSoft,
                borderColor: result.rankTrialReady ? colors.tealBorder : colors.goldBorder,
              },
            ]}
          >
            <AppIcon
              name={result.rankTrialReady ? 'sparkles' : finished ? 'check' : 'target'}
              size={27}
              color={result.rankTrialReady ? colors.teal : colors.gold}
              strokeWidth={1.9}
            />
          </View>
          <Text style={styles.resultKicker}>
            {result.rankTrialReady
              ? 'RANK TRIAL READY'
              : finished
                ? 'LOGGED TO HISTORY'
                : 'DELIBERATE PRACTICE'}
          </Text>
          <Text style={styles.resultTitle}>
            {result.rankTrialReady
              ? 'The gate is open'
              : finished
                ? result.xp > 0
                  ? `+${result.xp} XP`
                  : 'Milestone logged'
                : `Attempt ${result.progress} of ${result.targetCount}`}
          </Text>
          <Text style={styles.resultBody}>
            {result.rankTrialReady
              ? `All gate criteria for ${skill.name} are met. Run the rank trial from the skill page to certify the promotion.`
              : finished
                ? result.levelsGained > 0
                  ? `${skill.name} reached level ${result.newLevel} · ${rankLabelForLevel(result.newLevel, skill.id)}.`
                  : `${skill.name} practice recorded. Small sessions compound.`
                : `Keep going. ${(result.targetCount ?? 0) - (result.progress ?? 0)} attempt${(result.targetCount ?? 0) - (result.progress ?? 0) === 1 ? '' : 's'} remain to prove the standard.`}
          </Text>

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>XP</Text>
              <Text style={styles.resultStatValue}>{result.xp > 0 ? `+${result.xp}` : '—'}</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>LEVELS</Text>
              <Text style={styles.resultStatValue}>
                {result.levelsGained > 0 ? `+${result.levelsGained}` : '—'}
              </Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>SKILL LEVEL</Text>
              <Text style={styles.resultStatValue}>{result.newLevel}</Text>
            </View>
          </View>

          {result.rankTrialReady ? (
            <View style={styles.readyBanner}>
              <AppIcon name="key" size={13} color={colors.gold} />
              <Text style={styles.readyText}>
                Open {skill.name} and start the rank trial when you are ready to certify.
              </Text>
            </View>
          ) : null}

          <GoldButton
            label={finished ? 'Back to quests' : 'Continue'}
            icon="arrow-right"
            onPress={finished ? onDone : onBack}
            style={{ marginTop: 18 }}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen bottomPadding={40} keyboardShouldPersistTaps="handled">
      <TopBar
        title={active.kind === 'main' ? 'Main quest attempt' : 'Complete quest'}
        subtitle={skill.name}
        onBack={onBack}
        right={<RankChip label={difficultyLabel[active.difficulty]} color={difficultyColor[active.difficulty]} />}
      />

      <LinearGradient
        colors={[`${skill.accent}20`, 'rgba(18,25,36,0.96) 54%', 'rgba(14,20,29,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { borderColor: `${skill.accent}33` }]}
      >
        <View style={styles.heroTop}>
          <IconBubble
            icon={skill.icon}
            size={46}
            iconSize={22}
            color={skill.accent}
            background={`${skill.accent}12`}
            border={`${skill.accent}28`}
          />
          <View style={styles.heroCopy}>
            <View style={styles.heroKickerRow}>
              <Text style={styles.heroKicker}>
                {active.kind === 'main' ? 'MAIN QUEST' : 'SIDE QUEST'}
              </Text>
              {active.source === 'custom' ? (
                <Pill label="CUSTOM" color={colors.violet} background={colors.violetSoft} border={colors.violetBorder} />
              ) : null}
            </View>
            <Text style={styles.heroTitle}>{active.title}</Text>
          </View>
          <View style={styles.xpBox}>
            <Text style={styles.xpValue}>{active.xp > 0 ? `+${active.xp}` : '—'}</Text>
            <Text style={styles.xpLabel}>{active.xp > 0 ? 'XP' : 'MILESTONE'}</Text>
          </View>
        </View>
        <Text style={styles.heroDesc}>{active.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{skill.name}</Text>
          <View style={styles.metaDot} />
          <Text style={[styles.metaText, { color: difficultyColor[active.difficulty] }]}>
            {difficultyLabel[active.difficulty]}
          </Text>
          {active.secondarySkillIds?.length ? (
            <>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>
                + {active.secondarySkillIds.map((id) => skillById(state, id).name).join(', ')}
              </Text>
            </>
          ) : null}
        </View>
        {isMultiStep ? (
          <View style={styles.progressBlock}>
            <View style={styles.progressTop}>
              <Text style={styles.progressLabel}>
                Attempt {active.progress} of {active.targetCount} logged
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round((active.progress / active.targetCount) * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={active.progress / active.targetCount}
              color={skill.accent}
              height={4}
            />
          </View>
        ) : null}
      </LinearGradient>

      {active.kind === 'main' ? (
        <View style={styles.mainBanner}>
          <AppIcon name="target" size={13} color={colors.gold} />
          <Text style={styles.mainBannerText}>
            A main quest proves a rank standard. Log three deliberate attempts; only then does the
            demonstration count.
          </Text>
        </View>
      ) : null}

      <SectionHeader title="Session notes" note="Optional" />
      <TextField
        value={notes}
        onChangeText={setNotes}
        placeholder="What did you do? What felt strong or shaky?"
        multiline
        maxLength={500}
      />

      <SectionHeader title="Evidence" note="Optional · trust-based" />
      <TextField
        value={evidence}
        onChangeText={setEvidence}
        placeholder="A link, a file name, or a short description of proof"
        multiline
        maxLength={300}
        hint="Peritia does not verify evidence. It is a receipt for future you."
      />

      <Card style={styles.honestyCard}>
        <View style={styles.honestyTop}>
          <IconBubble icon="shield" size={32} iconSize={15} color={colors.teal} />
          <View style={styles.honestyCopy}>
            <Text style={styles.honestyTitle}>Log it honestly</Text>
            <Text style={styles.honestyBody}>
              The level only means something if the log is true. A short, real session beats an
              inflated one.
            </Text>
          </View>
        </View>
      </Card>

      <GoldButton
        label={actionLabel}
        icon="check"
        onPress={submit}
        disabled={submitting}
        style={{ marginTop: 16 }}
      />
      <OutlineButton label="Cancel" onPress={onBack} style={{ marginTop: 9 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  heroKicker: {
    fontFamily: fonts.semibold,
    fontSize: 7,
    letterSpacing: 1.3,
    color: colors.faint,
  },
  heroTitle: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.35,
    color: colors.text,
    marginTop: 4,
  },
  xpBox: {
    alignItems: 'flex-end',
  },
  xpValue: {
    fontFamily: fonts.displayBold,
    fontSize: 27,
    lineHeight: 29,
    color: colors.gold2,
  },
  xpLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6,
    letterSpacing: 0.9,
    color: colors.faint,
  },
  heroDesc: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14.5,
    color: colors.muted,
    marginTop: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 7.5,
    color: colors.faint,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  progressBlock: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  mainBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  mainBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: colors.gold2,
  },
  honestyCard: {
    marginTop: 14,
    padding: 12,
  },
  honestyTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  honestyCopy: {
    flex: 1,
  },
  honestyTitle: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.text,
  },
  honestyBody: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.faint,
    marginTop: 2,
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
    fontSize: 31,
    lineHeight: 35,
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
  readyBanner: {
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
  readyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: colors.gold2,
  },
});
