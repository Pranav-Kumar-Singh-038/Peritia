import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  useFonts,
} from '@expo-google-fonts/sora';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Backdrop } from './src/components/Backdrop';
import { BottomNav, type TabKey } from './src/components/BottomNav';
import { Emblem } from './src/components/Brand';
import { Toast } from './src/components/Toast';
import { AddQuestScreen } from './src/screens/AddQuestScreen';
import { AssessmentScreen } from './src/screens/AssessmentScreen';
import { BadgesScreen } from './src/screens/BadgesScreen';
import { CharacterScreen } from './src/screens/CharacterScreen';
import { DailyCheckinScreen } from './src/screens/DailyCheckinScreen';
import { FinanceCheckinScreen } from './src/screens/FinanceCheckinScreen';
import { FinanceDetailScreen } from './src/screens/FinanceDetailScreen';
import { JournalScreen } from './src/screens/JournalScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { QuestBoardScreen } from './src/screens/QuestBoardScreen';
import { QuestCompletionScreen } from './src/screens/QuestCompletionScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SkillDetailScreen } from './src/screens/SkillDetailScreen';
import { SkillsScreen } from './src/screens/SkillsScreen';
import { AppProvider, useApp } from './src/state/AppState';
import { colors, fonts } from './src/theme';
import type { AssessmentMode, SkillId } from './src/types';

SplashScreen.preventAutoHideAsync().catch(() => {});

type Route =
  | { name: 'skill'; skillId: SkillId }
  | { name: 'finance' }
  | { name: 'assessment'; skillId: SkillId; mode: AssessmentMode }
  | { name: 'daily-checkin' }
  | { name: 'finance-checkin' }
  | { name: 'add-quest' }
  | { name: 'quest-completion'; activeId: string }
  | { name: 'badges' }
  | { name: 'settings' };

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <AppRoot />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function AppRoot() {
  const { state, ready, toast, dismissToast } = useApp();

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!state) {
    return (
      <>
        <OnboardingScreen />
        <Toast toast={toast} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <>
      <AppShell />
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}

function AppShell() {
  const { state } = useApp();
  const [tab, setTab] = useState<TabKey>('character');
  const [stack, setStack] = useState<Route[]>([]);
  const current = stack[stack.length - 1] ?? null;

  const push = (route: Route) => setStack((existing) => [...existing, route]);
  const pop = () => setStack((existing) => existing.slice(0, -1));
  const goTab = (next: TabKey) => {
    setTab(next);
    setStack([]);
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 0) {
        setStack((existing) => existing.slice(0, -1));
        return true;
      }
      if (tab !== 'character') {
        setTab('character');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [stack.length, tab]);

  const openSkill = (skillId: SkillId) => push({ name: 'skill', skillId });
  const openFinance = () => push({ name: 'finance' });
  const openAssessment = (skillId: SkillId, mode: AssessmentMode) =>
    push({ name: 'assessment', skillId, mode });
  const openCheckin = () => push({ name: 'daily-checkin' });
  const openFinanceCheckin = () => push({ name: 'finance-checkin' });
  const openAddQuest = () => push({ name: 'add-quest' });
  const openQuestCompletion = (activeId: string) =>
    push({ name: 'quest-completion', activeId });
  const openBadges = () => push({ name: 'badges' });
  const openSettings = () => push({ name: 'settings' });

  let content: React.ReactNode;

  if (!current) {
    switch (tab) {
      case 'character':
        content = (
          <CharacterScreen
            onOpenSkill={openSkill}
            onOpenSkills={() => goTab('skills')}
            onOpenQuests={() => goTab('quests')}
            onOpenJournal={() => goTab('journal')}
            onOpenCheckin={openCheckin}
            onCompleteQuest={openQuestCompletion}
          />
        );
        break;
      case 'skills':
        content = (
          <SkillsScreen
            onOpenSkill={openSkill}
            onOpenFinance={openFinance}
            onAssess={(skillId) => openAssessment(skillId, 'initial')}
          />
        );
        break;
      case 'quests':
        content = (
          <QuestBoardScreen
            onCompleteQuest={openQuestCompletion}
            onAddQuest={openAddQuest}
          />
        );
        break;
      case 'journal':
        content = <JournalScreen />;
        break;
      case 'more':
        content = (
          <MoreScreen
            onOpenBadges={openBadges}
            onOpenFinance={openFinance}
            onOpenCheckin={openCheckin}
            onOpenSettings={openSettings}
          />
        );
        break;
      default:
        content = null;
    }
  } else {
    switch (current.name) {
      case 'skill':
        content = (
          <SkillDetailScreen
            skillId={current.skillId}
            onBack={pop}
            onAssess={(mode) => openAssessment(current.skillId, mode)}
          />
        );
        break;
      case 'finance':
        content = <FinanceDetailScreen onBack={pop} onCheckin={openFinanceCheckin} />;
        break;
      case 'assessment':
        content = (
          <AssessmentScreen
            skillId={current.skillId}
            mode={current.mode}
            onBack={pop}
          />
        );
        break;
      case 'daily-checkin':
        content = <DailyCheckinScreen onBack={pop} />;
        break;
      case 'finance-checkin':
        content = <FinanceCheckinScreen onBack={pop} />;
        break;
      case 'add-quest':
        content = <AddQuestScreen onBack={pop} />;
        break;
      case 'quest-completion':
        content = (
          <QuestCompletionScreen
            activeId={current.activeId}
            onBack={pop}
            onDone={pop}
          />
        );
        break;
      case 'badges':
        content = <BadgesScreen onBack={pop} />;
        break;
      case 'settings':
        content = <SettingsScreen onBack={pop} />;
        break;
      default:
        content = null;
    }
  }

  return (
    <View style={styles.root}>
      {content}
      {!current ? (
        <BottomNav
          activeTab={tab}
          onChange={goTab}
          questCount={state?.activeQuests.length ?? 0}
        />
      ) : null}
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Backdrop />
      <View style={styles.loadingCenter}>
        <Emblem size={72} />
        <Text style={styles.loadingWord}>PERITIA</Text>
        <Text style={styles.loadingTagline}>Prove your proficiency.</Text>
        <ActivityIndicator color={colors.gold} style={{ marginTop: 22 }} />
        <Text style={styles.loadingHint}>Opening your character…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCenter: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  loadingWord: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 3.4,
    color: colors.gold2,
    marginTop: 18,
  },
  loadingTagline: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
  },
  loadingHint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    marginTop: 10,
  },
});
