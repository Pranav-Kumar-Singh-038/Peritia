import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, difficultyColor, fonts } from '../theme';
import type { ActiveQuest, SkillState } from '../types';
import { AppIcon } from './AppIcon';
import { IconBubble } from './ui';

export function ActiveQuestRow({
  active,
  skill,
  onPress,
  onRemove,
  showProgress = false,
}: {
  active: ActiveQuest;
  skill: SkillState;
  onPress: () => void;
  onRemove?: () => void;
  showProgress?: boolean;
}) {
  const metric = skill.metrics.find((item) => item.key === active.metricKey);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.check, { borderColor: `${skill.accent}66` }]}>
        <AppIcon name="check" size={10} color={skill.accent} strokeWidth={2.4} />
      </View>
      <IconBubble icon={skill.icon} size={28} iconSize={13} color={skill.accent} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {active.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta} numberOfLines={1}>
            {skill.name}
            {metric ? ` · ${metric.short}` : ''}
          </Text>
          {active.kind === 'main' ? (
            <Text style={styles.mainTag}>MAIN</Text>
          ) : showProgress && active.targetCount > 1 ? (
            <Text style={styles.progressTag}>
              {active.progress}/{active.targetCount}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.xp, { color: difficultyColor[active.difficulty] }]}>
          {active.xp > 0 ? `+${active.xp}` : 'LOG'}
        </Text>
        {active.xp > 0 ? <Text style={styles.xpLabel}>XP</Text> : null}
      </View>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
        >
          <AppIcon name="x" size={12} color={colors.faint} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.055)',
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
    letterSpacing: -0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    flexShrink: 1,
  },
  mainTag: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: colors.gold,
  },
  progressTag: {
    fontFamily: fonts.semibold,
    fontSize: 7,
    color: colors.gold2,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 28,
  },
  xp: {
    fontFamily: fonts.semibold,
    fontSize: 9,
  },
  xpLabel: {
    fontFamily: fonts.medium,
    fontSize: 6,
    letterSpacing: 0.7,
    color: colors.faint,
    marginTop: 1,
  },
  remove: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
