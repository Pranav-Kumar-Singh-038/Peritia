import { LinearGradient } from 'expo-linear-gradient';
import React, { type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, spacing } from '../theme';
import { AppIcon } from './AppIcon';
import { Backdrop } from './Backdrop';

export function Screen({
  children,
  scroll = true,
  safeTop = true,
  bottomPadding = 116,
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = 'handled',
}: {
  children: ReactNode;
  scroll?: boolean;
  safeTop?: boolean;
  bottomPadding?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}) {
  const insets = useSafeAreaInsets();
  const top = safeTop ? insets.top + 8 : 0;
  const bottom = Math.max(bottomPadding, insets.bottom + 24);

  if (!scroll) {
    return (
      <View style={[styles.screen, style]}>
        <Backdrop />
        <View style={[styles.nonScrollContent, { paddingTop: top }]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, style]}>
      <Backdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: top, paddingBottom: bottom },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function TopBar({
  title,
  subtitle,
  onBack,
  right,
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  compact?: boolean;
}) {
  return (
    <View style={[styles.topBar, compact && styles.topBarCompact]}>
      <View style={styles.topBarLeft}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityLabel="Go back"
          >
            <AppIcon name="back" size={19} color={colors.text} />
          </Pressable>
        ) : null}
        <View style={styles.topBarTitles}>
          {title ? <Text style={styles.topBarTitle}>{title}</Text> : null}
          {subtitle ? <Text style={styles.topBarSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right ? <View style={styles.topBarRight}>{right}</View> : null}
    </View>
  );
}

export function SectionHeader({
  title,
  note,
  action,
  onAction,
  style,
}: {
  title: string;
  note?: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
      </View>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  style,
  accent,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: string;
}) {
  return (
    <LinearGradient
      colors={['rgba(20,28,41,0.94)', 'rgba(12,17,25,0.94)']}
      style={[styles.card, accent ? { borderColor: `${accent}33` } : null, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function GoldButton({
  label,
  onPress,
  icon,
  disabled = false,
  style,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  icon?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.goldButtonOuter,
        compact && styles.goldButtonCompact,
        disabled && styles.disabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={disabled ? ['#4c453a', '#39342c'] : [colors.gold2, '#d4a156']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.goldButtonInner, compact && styles.goldButtonInnerCompact]}
      >
        {icon ? <AppIcon name={icon} size={compact ? 13 : 15} color="#1a1206" strokeWidth={2.2} /> : null}
        <Text style={[styles.goldButtonText, compact && styles.goldButtonTextCompact]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({
  label,
  onPress,
  icon,
  disabled = false,
  style,
  compact = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  icon?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outlineButton,
        compact && styles.outlineButtonCompact,
        danger && styles.outlineDanger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
    >
      {icon ? (
        <AppIcon
          name={icon}
          size={compact ? 13 : 15}
          color={danger ? colors.danger : colors.text}
          strokeWidth={2}
        />
      ) : null}
      <Text
        style={[
          styles.outlineButtonText,
          compact && styles.outlineButtonTextCompact,
          danger && { color: colors.danger },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Pill({
  label,
  color = colors.muted,
  background = 'rgba(255,255,255,0.04)',
  border = 'rgba(255,255,255,0.08)',
  style,
}: {
  label: string;
  color?: string;
  background?: string;
  border?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: background, borderColor: border }, style]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function RankChip({ label, color = colors.gold }: { label: string; color?: string }) {
  return (
    <View style={[styles.rankChip, { borderColor: `${color}38`, backgroundColor: `${color}14` }]}>
      <Text style={[styles.rankChipText, { color }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({
  progress,
  color = colors.gold,
  height = 4,
  trackColor = 'rgba(255,255,255,0.07)',
  gradient = false,
  style,
}: {
  progress: number;
  color?: string;
  height?: number;
  trackColor?: string;
  gradient?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.progressTrack, { height, backgroundColor: trackColor }, style]}>
      {gradient ? (
        <LinearGradient
          colors={[color, colors.gold2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${clamped * 100}%` }]}
        />
      ) : (
        <View
          style={[
            styles.progressFill,
            { width: `${clamped * 100}%`, backgroundColor: color },
          ]}
        />
      )}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

export function IconBubble({
  icon,
  color = colors.gold,
  size = 34,
  iconSize = 16,
  background = 'rgba(255,255,255,0.045)',
  border = 'rgba(255,255,255,0.06)',
  style,
}: {
  icon: string;
  color?: string;
  size?: number;
  iconSize?: number;
  background?: string;
  border?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.iconBubble,
        { width: size, height: size, borderRadius: size * 0.29, backgroundColor: background, borderColor: border },
        style,
      ]}
    >
      <AppIcon name={icon} size={iconSize} color={color} strokeWidth={1.9} />
    </View>
  );
}

export function StatTile({
  label,
  value,
  hint,
  color = colors.text,
  style,
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.statTile, style]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <IconBubble icon={icon} size={42} iconSize={20} color={colors.gold} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action && onAction ? (
        <GoldButton label={action} onPress={onAction} compact style={{ marginTop: 14 }} />
      ) : null}
    </View>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: Array<{ key: T; label: string; count?: number }>;
  value: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segmented, style]}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.segmentButton, active && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {option.label}
              {typeof option.count === 'number' ? ` ${option.count}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
  autoFocus = false,
  maxLength,
  hint,
  style,
  inputStyle,
}: {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  multiline?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[styles.fieldWrap, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        keyboardType={keyboardType}
        multiline={multiline}
        autoFocus={autoFocus}
        maxLength={maxLength}
        style={[
          styles.textField,
          multiline && styles.textFieldMultiline,
          inputStyle,
        ]}
        selectionColor={colors.gold}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ key: T; label: string; color?: string }>;
  value: T;
  onChange: (key: T) => void;
  label?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.choiceRow}>
        {options.map((option) => {
          const active = option.key === value;
          const tint = option.color ?? colors.gold;
          return (
            <Pressable
              key={option.key}
              onPress={() => onChange(option.key)}
              style={[
                styles.choice,
                active && { borderColor: `${tint}66`, backgroundColor: `${tint}18` },
              ]}
            >
              <Text style={[styles.choiceText, active && { color: tint }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function InfoRow({
  label,
  value,
  color = colors.text,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );
}

export function BodyText({
  children,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  return (
    <Text numberOfLines={numberOfLines} style={[styles.bodyText, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  scrollContent: {
    paddingHorizontal: 18,
  },
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: 18,
  },
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  topBarCompact: {
    minHeight: 42,
    paddingBottom: 4,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  topBarTitles: {
    flex: 1,
  },
  topBarTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.2,
  },
  topBarSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.faint,
    marginTop: 2,
  },
  topBarRight: {
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.55,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  sectionNote: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.faint,
  },
  sectionAction: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.gold,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  goldButtonOuter: {
    borderRadius: 11,
    overflow: 'hidden',
  },
  goldButtonCompact: {
    borderRadius: 9,
  },
  goldButtonInner: {
    minHeight: 46,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  goldButtonInnerCompact: {
    minHeight: 34,
    paddingHorizontal: 13,
  },
  goldButtonText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#1a1206',
    letterSpacing: 0.1,
  },
  goldButtonTextCompact: {
    fontSize: 10,
  },
  outlineButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  outlineButtonCompact: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  outlineButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.text,
  },
  outlineButtonTextCompact: {
    fontSize: 10,
  },
  outlineDanger: {
    borderColor: 'rgba(251,113,133,0.3)',
    backgroundColor: 'rgba(251,113,133,0.06)',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.65,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  rankChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  rankChipText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: '100%',
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  iconBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statTile: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    letterSpacing: 1.15,
    color: colors.faint,
  },
  statValue: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    letterSpacing: -0.6,
    marginTop: 1,
  },
  statHint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.faint,
    marginTop: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 5,
    maxWidth: 260,
  },
  segmented: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
    gap: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: 'rgba(233,184,114,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(233,184,114,0.18)',
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.faint,
  },
  segmentTextActive: {
    color: colors.gold2,
    fontFamily: fonts.semibold,
  },
  fieldWrap: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    letterSpacing: 1.15,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 7,
  },
  textField: {
    minHeight: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.035)',
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  textFieldMultiline: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  fieldHint: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.faint,
    marginTop: 5,
    lineHeight: 14,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  choice: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  choiceText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  infoValue: {
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  bodyText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
});
