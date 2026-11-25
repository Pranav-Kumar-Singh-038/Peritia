import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import {
  Card,
  EmptyState,
  IconBubble,
  Pill,
  ProgressBar,
  Screen,
  SectionHeader,
  SegmentedControl,
  TopBar,
} from '../components/ui';
import { BADGES } from '../data/badges';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';
import type { BadgeDef } from '../types';
import { formatDate } from '../utils/date';

type BadgeFilter = 'all' | 'earned' | 'locked';

const TIER: Record<BadgeDef['tier'], { label: string; color: string; soft: string; border: string }> = {
  bronze: {
    label: 'BRONZE',
    color: '#d79a63',
    soft: 'rgba(215,154,99,0.10)',
    border: 'rgba(215,154,99,0.24)',
  },
  silver: {
    label: 'SILVER',
    color: '#cbd5e1',
    soft: 'rgba(203,213,225,0.10)',
    border: 'rgba(203,213,225,0.22)',
  },
  gold: {
    label: 'GOLD',
    color: colors.gold,
    soft: colors.goldSoft,
    border: colors.goldBorder,
  },
  special: {
    label: 'SPECIAL',
    color: colors.violet,
    soft: colors.violetSoft,
    border: colors.violetBorder,
  },
};

export function BadgesScreen({ onBack }: { onBack: () => void }) {
  const { state } = useApp();
  const [filter, setFilter] = useState<BadgeFilter>('all');
  if (!state) return null;

  const earnedMap = new Map(state.earnedBadges.map((badge) => [badge.id, badge.earnedAt]));
  const earnedCount = state.earnedBadges.length;
  const visible = BADGES.filter((badge) => {
    if (filter === 'all') return true;
    const earned = earnedMap.has(badge.id);
    return filter === 'earned' ? earned : !earned;
  });
  const nextLocked = BADGES.filter((badge) => !earnedMap.has(badge.id)).slice(0, 3);

  return (
    <Screen bottomPadding={40}>
      <TopBar
        title="Badges"
        subtitle={`${earnedCount} of ${BADGES.length} earned`}
        onBack={onBack}
      />

      <Card style={styles.summaryCard} accent={colors.gold}>
        <View style={styles.summaryTop}>
          <IconBubble icon="trophy" size={46} iconSize={22} color={colors.gold} />
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Proof of the work</Text>
            <Text style={styles.summaryBody}>
              Badges mark real milestones, not purchases. Every one is earned from your own log.
            </Text>
          </View>
          <View style={styles.summaryCount}>
            <Text style={styles.summaryNumber}>{earnedCount}</Text>
            <Text style={styles.summaryTotal}>/ {BADGES.length}</Text>
          </View>
        </View>
        <ProgressBar
          progress={earnedCount / BADGES.length}
          color={colors.gold}
          height={4}
          style={{ marginTop: 13 }}
        />
        <View style={styles.summaryFoot}>
          <Text style={styles.summaryFootText}>
            {Math.round((earnedCount / BADGES.length) * 100)}% of the badge collection
          </Text>
          <Text style={styles.summaryFootText}>
            {BADGES.length - earnedCount} remaining
          </Text>
        </View>
      </Card>

      {nextLocked.length ? (
        <>
          <SectionHeader title="Next up" note="Closest locked badges" />
          <View style={styles.nextRow}>
            {nextLocked.map((badge) => {
              const tier = TIER[badge.tier];
              return (
                <View key={badge.id} style={styles.nextCard}>
                  <View style={[styles.nextIcon, { backgroundColor: tier.soft, borderColor: tier.border }]}>
                    <AppIcon name={badge.icon} size={16} color={tier.color} />
                  </View>
                  <Text style={styles.nextName} numberOfLines={1}>
                    {badge.name}
                  </Text>
                  <Text style={styles.nextHint} numberOfLines={2}>
                    {badge.hint}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      <SectionHeader title="Collection" note={`${visible.length} shown`} />
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { key: 'all', label: 'All', count: BADGES.length },
          { key: 'earned', label: 'Earned', count: earnedCount },
          { key: 'locked', label: 'Locked', count: BADGES.length - earnedCount },
        ]}
        style={{ marginBottom: 12 }}
      />

      <View style={styles.grid}>
        {visible.map((badge) => {
          const earnedAt = earnedMap.get(badge.id);
          const earned = Boolean(earnedAt);
          const tier = TIER[badge.tier];
          return (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                earned
                  ? { borderColor: tier.border, backgroundColor: tier.soft }
                  : styles.badgeCardLocked,
              ]}
            >
              <View style={styles.badgeTop}>
                <View
                  style={[
                    styles.badgeIcon,
                    earned
                      ? { backgroundColor: tier.soft, borderColor: tier.border }
                      : styles.badgeIconLocked,
                  ]}
                >
                  <AppIcon
                    name={earned ? badge.icon : 'lock'}
                    size={20}
                    color={earned ? tier.color : colors.faint}
                    strokeWidth={earned ? 1.8 : 1.6}
                  />
                </View>
                {earned ? (
                  <Pill
                    label={tier.label}
                    color={tier.color}
                    background={tier.soft}
                    border={tier.border}
                  />
                ) : (
                  <AppIcon name="lock" size={11} color={colors.faint} />
                )}
              </View>
              <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDesc} numberOfLines={3}>
                {earned ? badge.description : badge.hint}
              </Text>
              <View style={styles.badgeFoot}>
                <Text style={[styles.badgeStatus, { color: earned ? tier.color : colors.faint }]}>
                  {earned ? 'EARNED' : 'LOCKED'}
                </Text>
                {earnedAt ? (
                  <Text style={styles.badgeDate}>{formatDate(earnedAt, 'short')}</Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {!visible.length ? (
        <Card>
          <EmptyState
            icon={filter === 'earned' ? 'award' : 'lock'}
            title={filter === 'earned' ? 'No badges earned yet' : 'Everything is unlocked'}
            body={
              filter === 'earned'
                ? 'Complete a quest or set a baseline assessment. The first badges arrive quickly.'
                : 'You have earned the entire collection. Extraordinary.'
            }
          />
        </Card>
      ) : null}

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          Badges are evaluated after each meaningful action. There is no shop, no purchase, and no
          way to lose a badge once earned.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    padding: 14,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.25,
  },
  summaryBody: {
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: colors.muted,
    marginTop: 3,
  },
  summaryCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  summaryNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 31,
    lineHeight: 33,
    color: colors.gold2,
    letterSpacing: -0.8,
  },
  summaryTotal: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.faint,
  },
  summaryFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryFootText: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
  },
  nextRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nextCard: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,25,36,0.82)',
    padding: 10,
  },
  nextIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextName: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.text,
    marginTop: 8,
  },
  nextHint: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    lineHeight: 11.5,
    color: colors.faint,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  badgeCard: {
    width: '48.5%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
  },
  badgeCardLocked: {
    borderColor: colors.border,
    backgroundColor: 'rgba(18,25,36,0.78)',
  },
  badgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconLocked: {
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  badgeName: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.text,
    marginTop: 9,
  },
  badgeNameLocked: {
    color: colors.muted,
  },
  badgeDesc: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 3,
    minHeight: 36,
  },
  badgeFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.055)',
  },
  badgeStatus: {
    fontFamily: fonts.semibold,
    fontSize: 6,
    letterSpacing: 0.9,
  },
  badgeDate: {
    fontFamily: fonts.regular,
    fontSize: 6.5,
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
});
