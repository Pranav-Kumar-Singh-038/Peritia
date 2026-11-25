import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import {
  Card,
  GoldButton,
  IconBubble,
  OutlineButton,
  ProgressBar,
  Screen,
  SectionHeader,
  TextField,
  TopBar,
} from '../components/ui';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';
import { formatDate, todayKey } from '../utils/date';

function ScaleRow({
  label,
  hint,
  value,
  min,
  max,
  step,
  color,
  onChange,
  format,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  return (
    <View style={styles.scaleRow}>
      <View style={styles.scaleHead}>
        <View style={styles.scaleCopy}>
          <Text style={styles.scaleLabel}>{label}</Text>
          <Text style={styles.scaleHint}>{hint}</Text>
        </View>
        <Text style={[styles.scaleValue, { color }]}>
          {format ? format(value) : Math.round(value)}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="rgba(255,255,255,0.1)"
        thumbTintColor={color}
      />
      <View style={styles.scaleEnds}>
        <Text style={styles.scaleEndText}>{format ? format(min) : min}</Text>
        <Text style={styles.scaleEndText}>{format ? format(max) : max}</Text>
      </View>
    </View>
  );
}

export function DailyCheckinScreen({ onBack }: { onBack: () => void }) {
  const { state, saveDailyCheckin } = useApp();
  if (!state) return null;
  const today = todayKey();
  const existing = state.dailyCheckins.find((checkin) => checkin.date === today) ?? null;

  const [sleepHours, setSleepHours] = useState(existing?.sleepHours ?? 7);
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality ?? 7);
  const [nutrition, setNutrition] = useState(existing?.nutrition ?? 7);
  const [mood, setMood] = useState(existing?.mood ?? 7);
  const [energy, setEnergy] = useState(existing?.energy ?? 7);
  const [note, setNote] = useState(existing?.note ?? '');

  const readiness = Math.round(((sleepQuality + nutrition + mood + energy) / 40) * 100);
  const readinessColor =
    readiness >= 75 ? colors.green : readiness >= 50 ? colors.gold : colors.rose;

  const submit = () => {
    saveDailyCheckin({
      sleepHours,
      sleepQuality,
      nutrition,
      mood,
      energy,
      note: note.trim() || undefined,
    });
    onBack();
  };

  return (
    <Screen bottomPadding={40}>
      <TopBar
        title="Daily check-in"
        subtitle={formatDate(today, 'long')}
        onBack={onBack}
        right={
          <View style={styles.streakPill}>
            <AppIcon name="flame" size={11} color={colors.gold} />
            <Text style={styles.streakText}>{state.streak.current}</Text>
          </View>
        }
      />

      <Card style={styles.introCard} accent={colors.violet}>
        <View style={styles.introTop}>
          <IconBubble icon="moon" size={40} iconSize={19} color={colors.violet} />
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>
              {existing ? 'Update today’s ritual' : 'How did today go?'}
            </Text>
            <Text style={styles.introBody}>
              Sleep, nutrition, mood, and energy feed your Vitality and Discipline attributes.
              Twenty seconds is enough.
            </Text>
          </View>
        </View>
        <View style={styles.readinessRow}>
          <View style={styles.readinessCopy}>
            <Text style={styles.readinessLabel}>TODAY’S READINESS</Text>
            <Text style={[styles.readinessValue, { color: readinessColor }]}>{readiness}</Text>
          </View>
          <View style={styles.readinessBar}>
            <ProgressBar progress={readiness / 100} color={readinessColor} height={5} />
            <Text style={styles.readinessHint}>
              {readiness >= 75
                ? 'Primed for a hard session.'
                : readiness >= 50
                  ? 'Steady. Keep the session honest.'
                  : 'Protect recovery and keep it light.'}
            </Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="Sleep" note="Recovery" />
      <Card style={styles.formCard}>
        <ScaleRow
          label="Hours slept"
          hint="Last night, as close as you can estimate."
          value={sleepHours}
          min={0}
          max={12}
          step={0.5}
          color={colors.blue}
          onChange={setSleepHours}
          format={(value) => `${value.toFixed(1)}h`}
        />
        <View style={styles.divider} />
        <ScaleRow
          label="Sleep quality"
          hint="How restorative did it feel?"
          value={sleepQuality}
          min={1}
          max={10}
          step={1}
          color={colors.blue}
          onChange={setSleepQuality}
        />
      </Card>

      <SectionHeader title="Body & mind" note="1–10" />
      <Card style={styles.formCard}>
        <ScaleRow
          label="Nutrition"
          hint="Did you eat in a way that supports your goals?"
          value={nutrition}
          min={1}
          max={10}
          step={1}
          color={colors.green}
          onChange={setNutrition}
        />
        <View style={styles.divider} />
        <ScaleRow
          label="Mood"
          hint="Overall emotional state today."
          value={mood}
          min={1}
          max={10}
          step={1}
          color={colors.gold}
          onChange={setMood}
        />
        <View style={styles.divider} />
        <ScaleRow
          label="Energy"
          hint="Physical and mental fuel available."
          value={energy}
          min={1}
          max={10}
          step={1}
          color={colors.teal}
          onChange={setEnergy}
        />
      </Card>

      <SectionHeader title="Notes" note="Optional" />
      <TextField
        value={note}
        onChangeText={setNote}
        placeholder="What shaped today? Anything worth remembering?"
        multiline
        maxLength={400}
      />

      <GoldButton
        label={existing ? 'Update check-in' : 'Save today’s check-in'}
        icon="check"
        onPress={submit}
      />
      <OutlineButton label="Cancel" onPress={onBack} style={{ marginTop: 9 }} />

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          One check-in per day. Editing today’s entry replaces it rather than stacking duplicates.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  streakText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.gold2,
  },
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
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  readinessCopy: {
    width: 66,
  },
  readinessLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6,
    letterSpacing: 0.8,
    color: colors.faint,
  },
  readinessValue: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -0.8,
  },
  readinessBar: {
    flex: 1,
  },
  readinessHint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    marginTop: 5,
  },
  formCard: {
    padding: 13,
  },
  scaleRow: {
    paddingVertical: 3,
  },
  scaleHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  scaleCopy: {
    flex: 1,
  },
  scaleLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  scaleHint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 2,
  },
  scaleValue: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 27,
    letterSpacing: -0.5,
  },
  slider: {
    width: '100%',
    height: 34,
    marginTop: 2,
  },
  scaleEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
    paddingHorizontal: 2,
  },
  scaleEndText: {
    fontFamily: fonts.regular,
    fontSize: 7,
    color: colors.faint,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 10,
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
