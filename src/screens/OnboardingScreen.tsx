import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandMark, Emblem } from '../components/Brand';
import { GoldButton, Screen, TextField } from '../components/ui';
import { CURRENCY_OPTIONS, currencySymbol } from '../utils/format';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';

export function OnboardingScreen() {
  const { createProfile } = useApp();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const trimmed = name.trim();
  const canStart = trimmed.length > 0;

  return (
    <Screen safeTop bottomPadding={36} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.wordmark}>
          <BrandMark size={16} />
          <Text style={styles.word}>PERITIA</Text>
        </View>
        <View style={styles.localPill}>
          <View style={styles.localDot} />
          <Text style={styles.localText}>LOCAL-FIRST</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.emblemGlow}>
          <Emblem size={78} />
        </View>
        <Text style={styles.kicker}>A LIFE RPG FOR REAL SKILLS</Text>
        <Text style={styles.title}>
          Prove your{'\n'}
          <Text style={styles.titleGold}>proficiency.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Turn deliberate practice into visible progress. Assess what you can do, set a main
          quest, and earn the rank.
        </Text>
      </View>

      <LinearGradient
        colors={['rgba(233,184,114,0.13)', 'rgba(18,25,36,0.94)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>Create your character</Text>
        <Text style={styles.cardBody}>
          Start with a name. Your skills, ranks, and history stay on this device.
        </Text>

        <TextField
          label="Character name"
          value={name}
          onChangeText={setName}
          placeholder="What should we call you?"
          maxLength={28}
          style={{ marginTop: 16 }}
        />

        <Text style={styles.fieldLabel}>Display currency</Text>
        <View style={styles.currencyRow}>
          {CURRENCY_OPTIONS.map((option) => {
            const active = option === currency;
            return (
              <Pressable
                key={option}
                onPress={() => setCurrency(option)}
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

        <GoldButton
          label="Begin my journey"
          icon="arrow-right"
          onPress={() => createProfile(trimmed, 'fresh', currency)}
          disabled={!canStart}
          style={{ marginTop: 18 }}
        />

        <Pressable
          onPress={() => createProfile(trimmed || 'Pranav', 'demo', currency)}
          style={({ pressed }) => [styles.demoLink, pressed && styles.pressed]}
        >
          <Text style={styles.demoLinkText}>Preview with a demo character</Text>
          <Text style={styles.demoArrow}>→</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.principles}>
        <Principle icon="◆" title="Metrics first" body="A level should mean something." />
        <Principle icon="◇" title="One main quest" body="Focus is part of the game." />
        <Principle icon="✦" title="No cloud" body="Your data never leaves the device." />
      </View>

      <Text style={styles.footer}>PERITIA · PROVE YOUR PROFICIENCY</Text>
    </Screen>
  );
}

function Principle({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <View style={styles.principle}>
      <Text style={styles.principleIcon}>{icon}</Text>
      <Text style={styles.principleTitle}>{title}</Text>
      <Text style={styles.principleBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  localPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    backgroundColor: colors.tealSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  localDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.teal,
  },
  localText: {
    fontFamily: fonts.semibold,
    fontSize: 7,
    letterSpacing: 1,
    color: colors.teal,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 22,
  },
  emblemGlow: {
    marginBottom: 16,
    shadowColor: colors.gold,
    shadowOpacity: 0.25,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    letterSpacing: 1.9,
    color: colors.faint,
    textAlign: 'center',
    marginBottom: 9,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 46,
    lineHeight: 47,
    letterSpacing: -1.6,
    color: colors.text,
    textAlign: 'center',
  },
  titleGold: {
    color: colors.gold2,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: 22,
    padding: 17,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.2,
  },
  cardBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.muted,
    marginTop: 4,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    letterSpacing: 1.15,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 7,
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
  demoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 14,
  },
  demoLinkText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  demoArrow: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.gold,
  },
  pressed: {
    opacity: 0.6,
  },
  principles: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  principle: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.022)',
    padding: 10,
  },
  principleIcon: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.gold,
    marginBottom: 7,
  },
  principleTitle: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.text,
  },
  principleBody: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 3,
  },
  footer: {
    fontFamily: fonts.medium,
    fontSize: 7,
    letterSpacing: 1.5,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 22,
  },
});
