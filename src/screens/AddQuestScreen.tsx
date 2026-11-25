import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import {
  Card,
  GoldButton,
  IconBubble,
  OutlineButton,
  Pill,
  Screen,
  SectionHeader,
  TextField,
  TopBar,
} from '../components/ui';
import { questDifficultyXp } from '../data/quests';
import { useApp } from '../state/AppState';
import { colors, difficultyColor, difficultyLabel, fonts } from '../theme';
import type { QuestDifficulty, SkillId } from '../types';
import { formatPercent } from '../utils/format';

export function AddQuestScreen({ onBack }: { onBack: () => void }) {
  const { state, createCustomQuest } = useApp();
  if (!state) return null;
  const initialSkill =
    state.skills.find((skill) => skill.assessedAt)?.id ?? state.skills[0].id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillId, setSkillId] = useState<SkillId>(initialSkill);
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [repeatable, setRepeatable] = useState(true);
  const [secondaryId, setSecondaryId] = useState<SkillId | null>(null);
  const [metricKey, setMetricKey] = useState(
    state.skills.find((skill) => skill.id === initialSkill)?.metrics[0]?.key ?? '',
  );

  const skill = state.skills.find((item) => item.id === skillId) ?? state.skills[0];
  const xp = skillId === 'finance' ? 0 : questDifficultyXp(difficulty);
  const canCreate = title.trim().length > 0;

  const selectSkill = (next: SkillId) => {
    setSkillId(next);
    const nextSkill = state.skills.find((item) => item.id === next);
    setMetricKey(nextSkill?.metrics[0]?.key ?? '');
    if (secondaryId === next) setSecondaryId(null);
  };

  const submit = () => {
    if (!canCreate) return;
    const quest = createCustomQuest({
      title,
      description,
      skillId,
      difficulty,
      repeatable,
      secondarySkillId: secondaryId,
      metricKey,
    });
    if (quest) onBack();
  };

  return (
    <Screen bottomPadding={40} keyboardShouldPersistTaps="handled">
      <TopBar title="New custom quest" subtitle="Side quest · personal practice" onBack={onBack} />

      <Card style={styles.introCard} accent={colors.violet}>
        <View style={styles.introTop}>
          <IconBubble icon="scroll" size={40} iconSize={19} color={colors.violet} />
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>Forge a quest</Text>
            <Text style={styles.introBody}>
              Make it specific enough to start today. Custom quests are always side quests and can
              repeat as often as you need.
            </Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="The quest" />
      <Card style={styles.formCard}>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Record three clean takes of the bridge"
          maxLength={80}
          autoFocus
          hint={`${title.length}/80`}
        />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What counts as done? What should future you know?"
          multiline
          maxLength={300}
          style={{ marginBottom: 0 }}
        />
      </Card>

      <SectionHeader title="Primary skill" note="Where XP lands" />
      <View style={styles.skillGrid}>
        {state.skills.map((item) => {
          const active = item.id === skillId;
          return (
            <Pressable
              key={item.id}
              onPress={() => selectSkill(item.id)}
              style={[
                styles.skillChip,
                active && {
                  borderColor: `${item.accent}66`,
                  backgroundColor: `${item.accent}16`,
                },
              ]}
            >
              <AppIcon
                name={item.icon}
                size={13}
                color={active ? item.accent : colors.faint}
              />
              <Text style={[styles.skillChipText, active && { color: item.accent }]}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Difficulty" note="Sets practice XP" />
      <View style={styles.difficultyRow}>
        {(['easy', 'medium', 'hard'] as QuestDifficulty[]).map((level) => {
          const active = difficulty === level;
          const tint = difficultyColor[level];
          return (
            <Pressable
              key={level}
              onPress={() => setDifficulty(level)}
              style={[
                styles.difficultyChip,
                active && { borderColor: `${tint}66`, backgroundColor: `${tint}16` },
              ]}
            >
              <View style={[styles.difficultyDot, { backgroundColor: tint }]} />
              <View>
                <Text style={[styles.difficultyLabel, active && { color: tint }]}>
                  {difficultyLabel[level]}
                </Text>
                <Text style={styles.difficultyXp}>
                  {skillId === 'finance' ? 'Milestone' : `+${questDifficultyXp(level)} XP`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Metric focus" note="Optional context" />
      <Card style={styles.formCard}>
        <Text style={styles.fieldLabel}>Which metric does this practice target?</Text>
        <View style={styles.metricRow}>
          {skill.metrics.map((metric) => {
            const active = metricKey === metric.key;
            return (
              <Pressable
                key={metric.key}
                onPress={() => setMetricKey(metric.key)}
                style={[
                  styles.metricChip,
                  active && {
                    borderColor: `${skill.accent}66`,
                    backgroundColor: `${skill.accent}14`,
                  },
                ]}
              >
                <Text style={[styles.metricChipText, active && { color: skill.accent }]}>
                  {metric.short}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.metricHint}>
          {skill.metrics.find((metric) => metric.key === metricKey)?.label ?? 'No metric selected'}
        </Text>
      </Card>

      <SectionHeader title="Secondary credit" note="Optional · 25% XP" />
      <Card style={styles.formCard}>
        <View style={styles.secondaryRow}>
          {state.skills
            .filter((item) => item.id !== skillId)
            .map((item) => {
              const active = secondaryId === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSecondaryId(active ? null : item.id)}
                  style={[
                    styles.secondaryChip,
                    active && {
                      borderColor: `${item.accent}66`,
                      backgroundColor: `${item.accent}14`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryText,
                      active && { color: item.accent },
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
        </View>
        <Text style={styles.secondaryHint}>
          {secondaryId
            ? `${skill.name} gets full XP · ${state.skills.find((s) => s.id === secondaryId)?.name} gets ${formatPercent(25)} of the XP.`
            : 'Select a second skill if this practice genuinely trains it too.'}
        </Text>
      </Card>

      <Card style={styles.repeatCard}>
        <View style={styles.repeatCopy}>
          <Text style={styles.repeatTitle}>Repeatable</Text>
          <Text style={styles.repeatBody}>
            Re-add this quest after completing it. Turn off for one-time milestones.
          </Text>
        </View>
        <Switch
          value={repeatable}
          onValueChange={setRepeatable}
          trackColor={{ false: 'rgba(255,255,255,0.12)', true: colors.goldBorder }}
          thumbColor={repeatable ? colors.gold2 : colors.faint}
        />
      </Card>

      <Card style={styles.previewCard}>
        <View style={styles.previewTop}>
          <View style={styles.previewCopy}>
            <Text style={styles.previewLabel}>QUEST PREVIEW</Text>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {title.trim() || 'Untitled quest'}
            </Text>
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>{skill.name}</Text>
              <View style={styles.metaDot} />
              <Text style={[styles.previewMetaText, { color: difficultyColor[difficulty] }]}>
                {difficultyLabel[difficulty]}
              </Text>
              <View style={styles.metaDot} />
              <Text style={styles.previewMetaText}>{repeatable ? 'Repeatable' : 'One-time'}</Text>
            </View>
          </View>
          <View style={styles.xpBox}>
            <Text style={styles.xpValue}>{xp > 0 ? `+${xp}` : '—'}</Text>
            <Text style={styles.xpLabel}>{xp > 0 ? 'XP' : 'MILESTONE'}</Text>
          </View>
        </View>
        {secondaryId ? (
          <Pill
            label={`SECONDARY · ${state.skills.find((s) => s.id === secondaryId)?.name.toUpperCase()}`}
            color={colors.violet}
            background={colors.violetSoft}
            border={colors.violetBorder}
            style={{ marginTop: 10 }}
          />
        ) : null}
      </Card>

      <GoldButton
        label="Create and add quest"
        icon="plus"
        onPress={submit}
        disabled={!canCreate}
        style={{ marginTop: 16 }}
      />
      <OutlineButton label="Cancel" onPress={onBack} style={{ marginTop: 9 }} />

      <View style={styles.footerNote}>
        <AppIcon name="info" size={12} color={colors.faint} />
        <Text style={styles.footerText}>
          Custom quests stay local. You can create as many as you like; only the ones you add to
          the board appear as active.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  formCard: {
    padding: 13,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    letterSpacing: 1.15,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 8,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  skillChipText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.muted,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  difficultyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  difficultyLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.muted,
  },
  difficultyXp: {
    fontFamily: fonts.regular,
    fontSize: 7,
    color: colors.faint,
    marginTop: 1,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metricChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  metricChipText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    letterSpacing: 0.5,
    color: colors.faint,
  },
  metricHint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    marginTop: 8,
  },
  secondaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  secondaryChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  secondaryText: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: colors.muted,
  },
  secondaryHint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12.5,
    color: colors.faint,
    marginTop: 9,
  },
  repeatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    padding: 13,
  },
  repeatCopy: {
    flex: 1,
  },
  repeatTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  repeatBody: {
    fontFamily: fonts.regular,
    fontSize: 8,
    lineHeight: 12,
    color: colors.faint,
    marginTop: 2,
  },
  previewCard: {
    marginTop: 12,
    padding: 13,
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  previewCopy: {
    flex: 1,
  },
  previewLabel: {
    fontFamily: fonts.semibold,
    fontSize: 6.5,
    letterSpacing: 1,
    color: colors.faint,
  },
  previewTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.text,
    marginTop: 3,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  previewMetaText: {
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
    letterSpacing: 1,
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
