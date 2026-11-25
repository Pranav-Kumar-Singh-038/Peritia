import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import {
  Card,
  GoldButton,
  IconBubble,
  InfoRow,
  OutlineButton,
  Pill,
  Screen,
  SectionHeader,
  TextField,
  TopBar,
} from '../components/ui';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';
import { formatDate, todayKey } from '../utils/date';
import { CURRENCY_OPTIONS, currencySymbol } from '../utils/format';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const {
    state,
    renameProfile,
    updateSettings,
    importState,
    eraseAllData,
    loadDemoProfile,
    showToast,
  } = useApp();
  const [name, setName] = useState(state?.profile.name ?? '');
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  useEffect(() => {
    if (state?.profile.name) setName(state.profile.name);
  }, [state?.profile.name]);

  if (!state) return null;
  const sizeKb = Math.max(1, Math.round(JSON.stringify(state).length / 1024));
  const nameChanged = name.trim().length > 0 && name.trim() !== state.profile.name;

  const exportData = async () => {
    setBusy('export');
    try {
      const directory = FileSystem.cacheDirectory;
      if (!directory) {
        showToast('No writable cache directory available.', 'danger');
        return;
      }
      const fileUri = `${directory}peritia-backup-${todayKey()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(state, null, 2));
      if (!(await Sharing.isAvailableAsync())) {
        showToast('Sharing is not available on this device.', 'danger');
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Peritia backup',
        UTI: 'public.json',
      });
    } catch {
      showToast('Could not export your data.', 'danger');
    } finally {
      setBusy(null);
    }
  };

  const importData = async () => {
    setBusy('import');
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled || !picked.assets.length) return;
      const json = await FileSystem.readAsStringAsync(picked.assets[0].uri);
      const outcome = importState(json);
      if (!outcome.ok) {
        Alert.alert('Import failed', outcome.error ?? 'The file could not be read.');
      }
    } catch {
      showToast('Could not import that file.', 'danger');
    } finally {
      setBusy(null);
    }
  };

  const confirmDemo = () => {
    Alert.alert(
      state.profile.demo ? 'Reset demo character?' : 'Load demo character?',
      state.profile.demo
        ? 'This rebuilds the demo character with fresh sample history.'
        : 'This replaces your current character and history with seeded demo data. Export a backup first if you want to keep it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: state.profile.demo ? 'Reset demo' : 'Load demo',
          style: 'destructive',
          onPress: loadDemoProfile,
        },
      ],
    );
  };

  const confirmErase = () => {
    Alert.alert(
      'Erase all data?',
      'Your character, quests, assessments, finance history, and badges will be permanently deleted from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase everything',
          style: 'destructive',
          onPress: () => {
            eraseAllData().catch(() => showToast('Could not erase local data.', 'danger'));
          },
        },
      ],
    );
  };

  return (
    <Screen bottomPadding={40}>
      <TopBar
        title="Settings"
        subtitle="Profile, preferences, and local data"
        onBack={onBack}
        right={state.profile.demo ? <Pill label="DEMO" color={colors.gold} background={colors.goldSoft} border={colors.goldBorder} /> : undefined}
      />

      <SectionHeader title="Profile" note="Shown on your character" />
      <Card style={styles.card}>
        <TextField
          label="Character name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          maxLength={28}
        />
        <GoldButton
          label="Save name"
          icon="check"
          onPress={() => renameProfile(name)}
          disabled={!nameChanged}
          compact
          style={{ marginBottom: 12 }}
        />
        <InfoRow label="Character created" value={formatDate(state.profile.createdAt, 'medium')} />
        <InfoRow
          label="Mode"
          value={state.profile.demo ? 'Demo character' : 'Personal character'}
          color={state.profile.demo ? colors.gold : colors.text}
        />
        <InfoRow label="Title" value={state.profile.title} />
      </Card>

      <SectionHeader title="Currency" note="Finance display only" />
      <Card style={styles.card}>
        <View style={styles.currencyRow}>
          {CURRENCY_OPTIONS.map((option) => {
            const active = option === state.settings.currency;
            return (
              <Pressable
                key={option}
                onPress={() => updateSettings({ currency: option })}
                style={[styles.currencyChip, active && styles.currencyChipActive]}
              >
                <Text style={[styles.currencySymbol, active && styles.currencySymbolActive]}>
                  {currencySymbol(option)}
                </Text>
                <Text style={[styles.currencyCode, active && styles.currencyCodeActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>
          Changing currency changes the symbol only. It does not convert recorded values.
        </Text>
      </Card>

      <SectionHeader title="Preferences" />
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Haptics</Text>
            <Text style={styles.switchBody}>
              Subtle feedback when you log progress, level up, or pass a gate.
            </Text>
          </View>
          <Switch
            value={state.settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
            trackColor={{ false: 'rgba(255,255,255,0.12)', true: colors.goldBorder }}
            thumbColor={state.settings.hapticsEnabled ? colors.gold2 : colors.faint}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Re-assessment reminders</Text>
            <Text style={styles.switchBody}>
              Show a quiet in-app reminder when a skill has not been assessed in 90 days.
            </Text>
          </View>
          <Switch
            value={state.settings.assessmentReminders}
            onValueChange={(value) => updateSettings({ assessmentReminders: value })}
            trackColor={{ false: 'rgba(255,255,255,0.12)', true: colors.goldBorder }}
            thumbColor={state.settings.assessmentReminders ? colors.gold2 : colors.faint}
          />
        </View>
      </Card>

      <SectionHeader title="Data" note={`${sizeKb} KB local`} />
      <Card style={styles.card}>
        <View style={styles.dataTop}>
          <IconBubble icon="database" size={36} iconSize={17} color={colors.teal} />
          <View style={styles.dataCopy}>
            <Text style={styles.dataTitle}>Local SQLite backup</Text>
            <Text style={styles.dataBody}>
              Export the entire character as one JSON document. Import it on this or another
              device to restore everything.
            </Text>
          </View>
        </View>
        <View style={styles.dataButtons}>
          <OutlineButton
            label={busy === 'export' ? 'Exporting…' : 'Export JSON'}
            icon="download"
            onPress={exportData}
            disabled={busy !== null}
            compact
            style={{ flex: 1 }}
          />
          <OutlineButton
            label={busy === 'import' ? 'Importing…' : 'Import JSON'}
            icon="upload"
            onPress={importData}
            disabled={busy !== null}
            compact
            style={{ flex: 1 }}
          />
        </View>
        <View style={styles.dataStats}>
          <Text style={styles.dataStat}>{state.completions.length} completions</Text>
          <Text style={styles.dataStat}>{state.assessments.length} assessments</Text>
          <Text style={styles.dataStat}>{state.financeCheckins.length} finance months</Text>
        </View>
      </Card>

      <SectionHeader title="Demo & reset" note="Destructive actions" />
      <Card style={styles.card} accent={state.profile.demo ? colors.gold : colors.border}>
        <View style={styles.demoRow}>
          <IconBubble icon="wand" size={34} iconSize={16} color={colors.gold} />
          <View style={styles.demoCopy}>
            <Text style={styles.demoTitle}>
              {state.profile.demo ? 'Reset demo character' : 'Load demo character'}
            </Text>
            <Text style={styles.demoBody}>
              {state.profile.demo
                ? 'Rebuild the sample character with fresh seeded history.'
                : 'Preview the app with a populated character. This replaces your current data.'}
            </Text>
          </View>
        </View>
        <OutlineButton
          label={state.profile.demo ? 'Reset demo data' : 'Load demo character'}
          icon="refresh"
          onPress={confirmDemo}
          compact
          style={{ marginTop: 11 }}
        />
        <View style={styles.divider} />
        <View style={styles.demoRow}>
          <IconBubble icon="trash" size={34} iconSize={16} color={colors.rose} />
          <View style={styles.demoCopy}>
            <Text style={styles.demoTitle}>Erase all data</Text>
            <Text style={styles.demoBody}>
              Delete the local database and return to onboarding. There is no cloud copy.
            </Text>
          </View>
        </View>
        <OutlineButton
          label="Erase everything"
          icon="trash"
          onPress={confirmErase}
          danger
          compact
          style={{ marginTop: 11 }}
        />
      </Card>

      <SectionHeader title="About" />
      <Card style={styles.card}>
        <InfoRow label="App" value="Peritia" />
        <InfoRow label="Version" value="1.0.0" />
        <InfoRow label="Tagline" value="Prove your proficiency." />
        <InfoRow label="Storage" value="On-device SQLite" color={colors.teal} />
        <InfoRow label="Network" value="None" color={colors.teal} />
        <InfoRow label="Skill decay" value="Off in v1" />
      </Card>

      <View style={styles.footerNote}>
        <AppIcon name="shield" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          Peritia is local-first by design. No account, no sync, no social features, no
          monetization, and no AI in v1.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 13,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  currencyChipActive: {
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
  },
  currencySymbol: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.faint,
  },
  currencySymbolActive: {
    color: colors.gold2,
  },
  currencyCode: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: colors.faint,
    letterSpacing: 0.4,
  },
  currencyCodeActive: {
    color: colors.gold,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12.5,
    color: colors.faint,
    marginTop: 9,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 3,
  },
  switchCopy: {
    flex: 1,
  },
  switchTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  switchBody: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 10,
  },
  dataTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dataCopy: {
    flex: 1,
  },
  dataTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  dataBody: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.muted,
    marginTop: 2,
  },
  dataButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dataStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dataStat: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  demoCopy: {
    flex: 1,
  },
  demoTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  demoBody: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
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
