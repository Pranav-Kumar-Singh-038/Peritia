import { LinearGradient } from 'expo-linear-gradient';
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
import { computeFinance } from '../logic/finance';
import { rankLabelForLevel } from '../logic/progression';
import { useApp, type FinanceResult } from '../state/AppState';
import { colors, fonts } from '../theme';
import type { FinanceValues } from '../types';
import { monthKey, monthLabel } from '../utils/date';
import { formatMoney, formatPercent } from '../utils/format';

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value.replace(/,/g, '').trim());
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

export function FinanceCheckinScreen({ onBack }: { onBack: () => void }) {
  const { state, saveFinanceCheckin } = useApp();
  if (!state) return null;
  const sorted = [...state.financeCheckins].sort((a, b) => b.month.localeCompare(a.month));
  const latest = sorted[0] ?? null;
  const currentMonth = monthKey();
  const existing = sorted.find((checkin) => checkin.month === currentMonth) ?? null;
  const base = existing ?? latest;

  const [income, setIncome] = useState(base ? String(base.income) : '');
  const [expenses, setExpenses] = useState(base ? String(base.expenses) : '');
  const [netWorth, setNetWorth] = useState(base ? String(base.netWorth) : '');
  const [emergencyMonths, setEmergencyMonths] = useState(
    base ? String(base.emergencyMonths) : '',
  );
  const [passiveIncome, setPassiveIncome] = useState(base ? String(base.passiveIncome) : '');
  const [runwayYears, setRunwayYears] = useState(base ? String(base.runwayYears) : '');
  const [debtToIncome, setDebtToIncome] = useState(
    base ? String(Math.round(base.debtToIncome * 1000) / 10) : '',
  );
  const [note, setNote] = useState('');
  const [result, setResult] = useState<FinanceResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const values: FinanceValues = {
    income: toNumber(income),
    expenses: toNumber(expenses),
    netWorth: toNumber(netWorth),
    emergencyMonths: toNumber(emergencyMonths),
    passiveIncome: toNumber(passiveIncome),
    runwayYears: toNumber(runwayYears),
    debtToIncome: toNumber(debtToIncome) / 100,
  };
  const score = computeFinance(values);
  const currency = state.settings.currency;
  const canSubmit = values.income > 0 && values.expenses > 0 && !submitting;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const outcome = saveFinanceCheckin(values, note.trim() || undefined);
    if (outcome) setResult(outcome);
    else setSubmitting(false);
  };

  if (result) {
    const promoted = result.rankUp;
    const held = result.held;
    return (
      <Screen bottomPadding={40}>
        <TopBar title="Check-in saved" subtitle={monthLabel(currentMonth)} onBack={onBack} />
        <Card
          style={styles.resultCard}
          accent={promoted ? colors.teal : held ? colors.rose : colors.gold}
        >
          <View
            style={[
              styles.resultIcon,
              {
                backgroundColor: promoted
                  ? colors.tealSoft
                  : held
                    ? colors.roseSoft
                    : colors.goldSoft,
                borderColor: promoted
                  ? colors.tealBorder
                  : held
                    ? colors.roseBorder
                    : colors.goldBorder,
              },
            ]}
          >
            <AppIcon
              name={promoted ? 'arrow-up' : held ? 'lock' : 'check'}
              size={26}
              color={promoted ? colors.teal : held ? colors.rose : colors.gold}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.resultKicker}>
            {promoted ? 'FINANCE RANK UP' : held ? 'RANK GATE HELD' : 'MONTHLY CHECK-IN'}
          </Text>
          <Text style={styles.resultTitle}>
            {promoted
              ? result.rankLabel
              : held
                ? 'Metrics recorded'
                : `Level ${result.level}`}
          </Text>
          <Text style={styles.resultBody}>
            {promoted
              ? `Your finance level rose to ${result.level}. ${result.rankLabel} is now certified.`
              : held
                ? `Your raw score of ${result.rawScore} would cross the rank gate, but these requirements are still unmet.`
                : `Your check-in is saved at level ${result.level}. Keep the system steady and check in again next month.`}
          </Text>

          {held && result.unmet.length ? (
            <View style={styles.unmetList}>
              {result.unmet.map((item) => (
                <View key={item} style={styles.unmetRow}>
                  <View style={styles.unmetDot} />
                  <Text style={styles.unmetText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>RAW SCORE</Text>
              <Text style={styles.resultStatValue}>{result.rawScore}</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>CERTIFIED LEVEL</Text>
              <Text style={styles.resultStatValue}>{result.level}</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>SAVINGS RATE</Text>
              <Text style={styles.resultStatValueSmall}>
                {formatPercent(result.checkin.savingsRate * 100, 1)}
              </Text>
            </View>
          </View>

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
      <TopBar
        title="Monthly check-in"
        subtitle={`${monthLabel(currentMonth)} · ${currency}`}
        onBack={onBack}
      />

      <LinearGradient
        colors={['rgba(94,234,212,0.14)', 'rgba(18,25,36,0.96)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.preview}
      >
        <View style={styles.previewTop}>
          <View>
            <Text style={styles.previewLabel}>LIVE FINANCE SCORE</Text>
            <Text style={styles.previewScore}>{Math.round(score.weightedScore)}</Text>
          </View>
          <View style={styles.previewLevel}>
            <Text style={styles.previewLevelLabel}>PROJECTED LEVEL</Text>
            <Text style={styles.previewLevelValue}>{score.level}</Text>
            <Text style={styles.previewRank}>{rankLabelForLevel(score.level, 'finance')}</Text>
          </View>
        </View>
        <ProgressBar progress={score.weightedScore / 100} color={colors.teal} height={4} />
        <Text style={styles.previewNote}>
          {existing
            ? 'This updates the check-in already recorded for this month.'
            : 'One check-in per month. Your saved level updates when you submit.'}
        </Text>
      </LinearGradient>

      <View style={styles.metricStrip}>
        {[
          { label: 'INC', value: score.incomeScore },
          { label: 'SAV', value: score.savingsScore },
          { label: 'EMG', value: score.emergencyScore },
          { label: 'PAS', value: score.passiveScore },
          { label: 'RUN', value: score.runwayScore },
          { label: 'DEB', value: score.debtScore },
        ].map((metric) => (
          <View key={metric.label} style={styles.metricPill}>
            <Text style={styles.metricPillLabel}>{metric.label}</Text>
            <Text style={styles.metricPillValue}>{Math.round(metric.value)}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Cash flow" note={`Reported in ${currency}`} />
      <Card style={styles.formCard}>
        <TextField
          label={`Monthly income (${currency})`}
          value={income}
          onChangeText={setIncome}
          placeholder="0"
          keyboardType="decimal-pad"
        />
        <TextField
          label={`Monthly expenses (${currency})`}
          value={expenses}
          onChangeText={setExpenses}
          placeholder="0"
          keyboardType="decimal-pad"
        />
        <TextField
          label={`Net worth (${currency})`}
          value={netWorth}
          onChangeText={setNetWorth}
          placeholder="0"
          keyboardType="decimal-pad"
          hint="Total assets minus total debts. Negative values are entered as 0 for v1."
        />
        <TextField
          label="Debt-to-income (%)"
          value={debtToIncome}
          onChangeText={setDebtToIncome}
          placeholder="0"
          keyboardType="decimal-pad"
          hint="Monthly debt payments divided by monthly income, as a percentage."
          style={{ marginBottom: 0 }}
        />
      </Card>

      <SectionHeader title="Resilience" note="Months and years" />
      <Card style={styles.formCard}>
        <TextField
          label="Emergency fund (months)"
          value={emergencyMonths}
          onChangeText={setEmergencyMonths}
          placeholder="0"
          keyboardType="decimal-pad"
          hint="How many months of expenses could you cover with cash reserves?"
        />
        <TextField
          label="Runway (years)"
          value={runwayYears}
          onChangeText={setRunwayYears}
          placeholder="0"
          keyboardType="decimal-pad"
          hint="Years your invested assets could sustain your current lifestyle."
          style={{ marginBottom: 0 }}
        />
      </Card>

      <SectionHeader title="Optionality" note="Income not tied to hours" />
      <Card style={styles.formCard}>
        <TextField
          label={`Passive income (${currency} / month)`}
          value={passiveIncome}
          onChangeText={setPassiveIncome}
          placeholder="0"
          keyboardType="decimal-pad"
          hint="Royalties, dividends, rent, products, or other income that arrives without trading time."
          style={{ marginBottom: 0 }}
        />
      </Card>

      <SectionHeader title="Notes" note="Optional" />
      <TextField
        value={note}
        onChangeText={setNote}
        placeholder="What changed this month? What is the next financial target?"
        multiline
        maxLength={400}
      />

      <View style={styles.breakdown}>
        <Text style={styles.breakdownTitle}>How this is scored</Text>
        <Text style={styles.breakdownText}>
          Income coverage 15% · Savings rate 20% · Emergency fund 20% · Passive income 20% ·
          Runway 15% · Debt control 10%. Rank gates add hard thresholds on top of the score.
        </Text>
      </View>

      <GoldButton
        label={existing ? 'Update this month' : 'Save monthly check-in'}
        icon="check"
        onPress={submit}
        disabled={!canSubmit}
      />
      <OutlineButton label="Cancel" onPress={onBack} style={{ marginTop: 9 }} />

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          Finance is trust-based. Use real numbers you could defend to yourself. Values are stored
          only on this device.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    padding: 14,
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewLabel: {
    fontFamily: fonts.semibold,
    fontSize: 7,
    letterSpacing: 1.1,
    color: colors.faint,
  },
  previewScore: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.2,
    color: colors.teal,
  },
  previewLevel: {
    alignItems: 'flex-end',
  },
  previewLevelLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 0.9,
    color: colors.faint,
  },
  previewLevelValue: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    lineHeight: 29,
    color: colors.text,
  },
  previewRank: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: colors.gold2,
  },
  previewNote: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.faint,
    marginTop: 8,
  },
  metricStrip: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  metricPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,25,36,0.78)',
  },
  metricPillLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 0.7,
    color: colors.faint,
  },
  metricPillValue: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.text,
    marginTop: 1,
  },
  formCard: {
    padding: 13,
  },
  breakdown: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
    marginBottom: 14,
  },
  breakdownTitle: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.muted,
    marginBottom: 4,
  },
  breakdownText: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
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
  unmetList: {
    width: '100%',
    gap: 7,
    marginTop: 14,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.roseBorder,
    backgroundColor: colors.roseSoft,
  },
  unmetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  unmetDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.rose,
  },
  unmetText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: colors.rose,
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
    fontSize: 11,
    color: colors.text,
    marginTop: 5,
    textAlign: 'center',
  },
});
