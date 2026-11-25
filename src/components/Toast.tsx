import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import type { ToastTone } from '../types';
import { AppIcon } from './AppIcon';
import type { ToastMessage } from '../state/AppState';

const TONE: Record<ToastTone, { color: string; border: string; bg: string; icon: string }> = {
  default: {
    color: colors.text,
    border: colors.borderStrong,
    bg: 'rgba(23,32,45,0.98)',
    icon: 'info',
  },
  success: {
    color: colors.green,
    border: colors.greenBorder,
    bg: 'rgba(12,32,27,0.98)',
    icon: 'check-circle',
  },
  gold: {
    color: colors.gold2,
    border: colors.goldBorder,
    bg: 'rgba(36,28,15,0.98)',
    icon: 'sparkles',
  },
  danger: {
    color: colors.danger,
    border: colors.roseBorder,
    bg: 'rgba(37,16,22,0.98)',
    icon: 'alert-triangle',
  },
};

export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    translate.setValue(-12);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(translate, { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }),
    ]).start();
  }, [toast?.id, opacity, translate, toast]);

  if (!toast) return null;
  const tone = TONE[toast.tone];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { top: insets.top + 8, opacity, transform: [{ translateY: translate }] },
      ]}
    >
      <Pressable
        onPress={onDismiss}
        style={[styles.toast, { backgroundColor: tone.bg, borderColor: tone.border }]}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${tone.color}18` }]}>
          <AppIcon name={tone.icon} size={14} color={tone.color} strokeWidth={2} />
        </View>
        <Text style={[styles.text, { color: tone.color }]} numberOfLines={3}>
          {toast.message}
        </Text>
        <AppIcon name="x" size={12} color={colors.faint} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 50,
    elevation: 20,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 11,
    shadowColor: colors.black,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 15,
  },
});
