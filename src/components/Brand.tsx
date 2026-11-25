import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

export function BrandMark({ size = 20, color = colors.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z"
        fill="none"
        stroke={color}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={2.1} fill={color} />
    </Svg>
  );
}

export function Emblem({ size = 58 }: { size?: number }) {
  return (
    <View
      style={[
        styles.emblem,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
        },
      ]}
    >
      <Svg width={size * 0.72} height={size * 0.72} viewBox="0 0 64 64">
        <Path
          d="M32 4 60 32 32 60 4 32Z"
          fill="rgba(233,184,114,.04)"
          stroke="rgba(233,184,114,.34)"
          strokeWidth={1}
        />
        <Path
          d="M32 12 52 32 32 52 12 32Z"
          fill="none"
          stroke="rgba(233,184,114,.18)"
          strokeWidth={1}
        />
        <Path
          d="M32 17 39 25 47 32 39 39 32 47 25 39 17 32 25 25Z"
          fill="rgba(233,184,114,.12)"
          stroke={colors.gold}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <Circle cx={32} cy={32} r={3} fill={colors.gold} />
      </Svg>
    </View>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.wordmark}>
      <BrandMark size={compact ? 15 : 17} />
      <Text style={[styles.word, compact && styles.wordCompact]}>PERITIA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emblem: {
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: 'rgba(233,184,114,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
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
  wordCompact: {
    fontSize: 10,
    letterSpacing: 2.1,
  },
});
