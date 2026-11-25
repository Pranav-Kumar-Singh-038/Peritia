import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { BrandMark } from '../components/Brand';
import { Heatmap } from '../components/Heatmap';
import {
  Card,
  EmptyState,
  IconBubble,
  Pill,
  ProgressBar,
  Screen,
  SectionHeader,
  SegmentedControl,
} from '../components/ui';
import {
  activityStats,
  buildActivityCounts,
  eventDayLabel,
  eventsGroupedByDay,
  weeklyXp,
} from '../logic/journal';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../theme';
import type { ActivityEvent, ActivityType } from '../types';
import { formatDate } from '../utils/date';

type JournalFilter = 'all' | 'practice' | 'progress' | 'rituals';

const EVENT_META: Record<ActivityType, { icon: string; color: string; label: string }> = {
  quest: { icon: 'target', color: colors.gold, label: 'Practice' },
  assessment: { icon: 'scan', color: colors.violet, label: 'Assessment' },
  'rank-up': { icon: 'arrow-up', color: colors.teal, label: 'Rank up' },
  finance: { icon: 'wallet', color: colors.teal, label: 'Finance' },
  checkin: { icon: 'moon', color: colors.blue, label: 'Ritual' },
  badge: { icon: 'award', color: colors.gold, label: 'Badge' },
  system: { icon: 'sparkles', color: colors.muted, label: 'System' },
};

function eventMatches(event: ActivityEvent, filter: JournalFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'practice') return event.type === 'quest';
  if (filter === 'rituals') return event.type === 'checkin' || event.type === 'finance';
  return ['assessment', 'rank-up', 'badge', 'system'].includes(event.type);
}

export function JournalScreen() {
  const { state } = useApp();
  const [filter, setFilter] = useState<JournalFilter>('all');
  if (!state) return null;

  const stats = activityStats(state);
  const counts = buildActivityCounts(state);
  const week = weeklyXp(state);
  const maxWeek = Math.max(10, ...week.map((point) => point.value));
  const filtered = state.events.filter((event) => eventMatches(event, filter));
  const groups = eventsGroupedByDay(filtered);
  const totalBadges = state.earnedBadges.length;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.wordmark}>
          <BrandMark size={16} />
          <Text style={styles.word}>PERITIA</Text>
        </View>
        <Pill
          label={`${stats.streak} DAY STREAK`}
          color={colors.gold}
          background={colors.goldSoft}
          border={colors.goldBorder}
        />
      </View>

      <Text style={styles.title}>Journal</Text>
      <Text style={styles.subtitle}>
        The record of what you actually did. No decay, no erased history.
      </Text>

      <Card style={styles.statsCard}>
        <View style={styles.statsTop}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>CURRENT STREAK</Text>
            <Text style={styles.statValue}>
              {stats.streak}
              <Text style={styles.statUnit}>d</Text>
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>ACTIVE DAYS · 30D</Text>
            <Text style={styles.statValue}>{stats.activeDays}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>THIS WEEK</Text>
            <Text style={styles.statValue}>{stats.weekXp}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>SESSIONS</Text>
            <Text style={styles.statValue}>{stats.totalQuests}</Text>
          </View>
        </View>
        <View style={styles.statsFoot}>
          <Text style={styles.statsFootText}>
            Longest streak {state.streak.longest} days
          </Text>
          <Text style={styles.statsFootText}>
            {stats.assessments} assessments · {totalBadges} badges
          </Text>
        </View>
      </Card>

      <SectionHeader title="Consistency" note="Last 12 weeks" />
      <Card style={styles.heatmapCard}>
        <Heatmap counts={counts} weeks={12} />
        <View style={styles.heatmapFoot}>
          <Text style={styles.heatmapFootText}>
            Every quest, check-in, and assessment leaves a mark.
          </Text>
        </View>
      </Card>

      <SectionHeader title="This week" note={`${stats.weekXp} XP earned`} />
      <Card style={styles.weekCard}>
        <View style={styles.weekChart}>
          {week.map((point) => (
            <View key={point.key} style={styles.weekColumn}>
              <Text style={styles.weekValue}>{point.value > 0 ? point.value : ''}</Text>
              <View style={styles.weekTrack}>
                <View
                  style={[
                    styles.weekBar,
                    {
                      height: `${Math.max(point.value > 0 ? 8 : 3, (point.value / maxWeek) * 100)}%`,
                      backgroundColor:
                        point.value > 0 ? colors.gold : 'rgba(255,255,255,0.05)',
                    },
                  ]}
                />
              </View>
              <Text style={styles.weekLabel}>{point.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title="Timeline" note={`${filtered.length} events`} />
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { key: 'all', label: 'All' },
          { key: 'practice', label: 'Practice' },
          { key: 'progress', label: 'Progress' },
          { key: 'rituals', label: 'Rituals' },
        ]}
        style={{ marginBottom: 12 }}
      />

      {groups.length ? (
        groups.map((group) => (
          <View key={group.day} style={styles.dayGroup}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{eventDayLabel(group.day)}</Text>
              <View style={styles.dayLine} />
              <Text style={styles.dayCount}>
                {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
              </Text>
            </View>
            <Card style={styles.timelineCard}>
              {group.events.map((event, index) => {
                const meta = EVENT_META[event.type];
                const time = new Date(event.createdAt).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                });
                return (
                  <View
                    key={event.id}
                    style={[
                      styles.eventRow,
                      index === group.events.length - 1 && styles.eventRowLast,
                    ]}
                  >
                    <IconBubble
                      icon={meta.icon}
                      size={30}
                      iconSize={14}
                      color={meta.color}
                      background={`${meta.color}10`}
                      border={`${meta.color}22`}
                    />
                    <View style={styles.eventCopy}>
                      <View style={styles.eventTitleRow}>
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        {event.xp ? (
                          <Text style={styles.eventXp}>+{event.xp} XP</Text>
                        ) : null}
                      </View>
                      <Text style={styles.eventDetail} numberOfLines={2}>
                        {event.detail}
                      </Text>
                      <View style={styles.eventMeta}>
                        <Text style={[styles.eventType, { color: meta.color }]}>
                          {meta.label.toUpperCase()}
                        </Text>
                        <View style={styles.metaDot} />
                        <Text style={styles.eventTime}>{time}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>
        ))
      ) : (
        <Card>
          <EmptyState
            icon="journal"
            title="Nothing logged yet"
            body={
              filter === 'all'
                ? 'Complete a quest or a daily check-in. Your history will build itself.'
                : 'No events match this filter yet. Try another view.'
            }
          />
        </Card>
      )}

      <SectionHeader title="Streak record" note="No decay in v1" />
      <Card style={styles.streakCard}>
        <View style={styles.streakTop}>
          <IconBubble icon="flame" size={38} iconSize={18} color={colors.gold} />
          <View style={styles.streakCopy}>
            <Text style={styles.streakTitle}>
              {state.streak.current} days, unbroken
            </Text>
            <Text style={styles.streakBody}>
              Longest run: {state.streak.longest} days
              {state.streak.lastActiveDate
                ? ` · last active ${formatDate(state.streak.lastActiveDate, 'short')}`
                : ''}
            </Text>
          </View>
        </View>
        <ProgressBar
          progress={state.streak.longest ? state.streak.current / state.streak.longest : 0}
          color={colors.gold}
          height={3}
          style={{ marginTop: 12 }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    letterSpacing: -1.1,
    color: colors.text,
    marginTop: 14,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
    marginTop: 4,
    maxWidth: 310,
  },
  statsCard: {
    marginTop: 16,
    padding: 13,
  },
  statsTop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stat: {
    flex: 1,
    minWidth: 0,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 7,
  },
  statLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6,
    letterSpacing: 0.7,
    color: colors.faint,
  },
  statValue: {
    fontFamily: fonts.displayBold,
    fontSize: 21,
    lineHeight: 24,
    color: colors.text,
    marginTop: 1,
  },
  statUnit: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.faint,
  },
  statsFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statsFootText: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
  },
  heatmapCard: {
    padding: 12,
  },
  heatmapFoot: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  heatmapFootText: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: colors.faint,
  },
  weekCard: {
    padding: 12,
  },
  weekChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 92,
    gap: 7,
  },
  weekColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  weekValue: {
    fontFamily: fonts.medium,
    fontSize: 7,
    color: colors.muted,
    height: 10,
  },
  weekTrack: {
    flex: 1,
    width: '100%',
    maxWidth: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.035)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekBar: {
    width: '100%',
    borderRadius: 4,
  },
  weekLabel: {
    fontFamily: fonts.medium,
    fontSize: 7,
    color: colors.faint,
    marginTop: 4,
  },
  dayGroup: {
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dayLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.muted,
  },
  dayLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dayCount: {
    fontFamily: fonts.regular,
    fontSize: 7,
    color: colors.faint,
  },
  timelineCard: {
    paddingHorizontal: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.055)',
  },
  eventRowLast: {
    borderBottomWidth: 0,
  },
  eventCopy: {
    flex: 1,
    minWidth: 0,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  eventTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.text,
  },
  eventXp: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: colors.gold,
    marginTop: 1,
  },
  eventDetail: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.faint,
    marginTop: 2,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  eventType: {
    fontFamily: fonts.semibold,
    fontSize: 6,
    letterSpacing: 0.8,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  eventTime: {
    fontFamily: fonts.regular,
    fontSize: 7,
    color: colors.faint,
  },
  streakCard: {
    padding: 13,
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  streakCopy: {
    flex: 1,
  },
  streakTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  streakBody: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.faint,
    marginTop: 2,
  },
});
