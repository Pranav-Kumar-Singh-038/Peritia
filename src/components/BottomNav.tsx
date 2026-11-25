import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { AppIcon } from './AppIcon';

export type TabKey = 'character' | 'skills' | 'quests' | 'journal' | 'more';

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'character', label: 'Character', icon: 'user' },
  { key: 'skills', label: 'Skills', icon: 'skills' },
  { key: 'quests', label: 'Quests', icon: 'quests' },
  { key: 'journal', label: 'Journal', icon: 'journal' },
  { key: 'more', label: 'More', icon: 'more' },
];

export function BottomNav({
  activeTab,
  onChange,
  questCount,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  questCount: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <LinearGradient
        colors={['rgba(8,11,16,0)', 'rgba(8,11,16,0.88)', 'rgba(8,11,16,0.99)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.border, { bottom: 0 }]} />
      <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              {active ? <View style={styles.indicator} /> : null}
              <View>
                <AppIcon
                  name={tab.icon}
                  size={18}
                  color={active ? colors.gold2 : colors.faint}
                  strokeWidth={active ? 2 : 1.7}
                />
                {tab.key === 'quests' && questCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{questCount > 9 ? '9+' : questCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 20,
  },
  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 9,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 4,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.6,
  },
  indicator: {
    position: 'absolute',
    top: -13,
    width: 17,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 7.5,
    letterSpacing: 0.1,
    color: colors.faint,
  },
  labelActive: {
    color: colors.gold2,
    fontFamily: fonts.semibold,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 7,
    color: '#1a1206',
  },
});
