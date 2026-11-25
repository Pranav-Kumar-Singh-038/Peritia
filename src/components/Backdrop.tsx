import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, G, Line, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

export function Backdrop() {
  const { width, height } = useWindowDimensions();
  const verticals: number[] = [];
  const horizontals: number[] = [];
  for (let x = 18; x < width; x += 36) verticals.push(x);
  for (let y = 24; y < height; y += 36) horizontals.push(y);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.bgDeep, colors.bg, '#06090e']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="goldGlow" cx="50%" cy="0%" r="70%">
            <Stop offset="0%" stopColor={colors.gold} stopOpacity={0.16} />
            <Stop offset="55%" stopColor={colors.gold} stopOpacity={0.035} />
            <Stop offset="100%" stopColor={colors.gold} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="tealGlow" cx="100%" cy="48%" r="60%">
            <Stop offset="0%" stopColor={colors.teal} stopOpacity={0.07} />
            <Stop offset="100%" stopColor={colors.teal} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="violetGlow" cx="0%" cy="90%" r="55%">
            <Stop offset="0%" stopColor={colors.violet} stopOpacity={0.06} />
            <Stop offset="100%" stopColor={colors.violet} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#goldGlow)" />
        <Rect width={width} height={height} fill="url(#tealGlow)" />
        <Rect width={width} height={height} fill="url(#violetGlow)" />
        <G opacity={0.045}>
          {verticals.map((x) => (
            <Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={height} stroke={colors.white} strokeWidth={1} />
          ))}
          {horizontals.map((y) => (
            <Line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke={colors.white} strokeWidth={1} />
          ))}
        </G>
      </Svg>
    </View>
  );
}
