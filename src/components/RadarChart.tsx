import React from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Line,
  Polygon,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors, fonts } from '../theme';
import type { AttributeScore } from '../types';

export function RadarChart({
  attributes,
  size = 148,
  showLabels = false,
}: {
  attributes: AttributeScore[];
  size?: number;
  showLabels?: boolean;
}) {
  const padding = showLabels ? 24 : 9;
  const center = size / 2;
  const radius = size / 2 - padding;
  const count = attributes.length;
  const angleFor = (index: number) => -Math.PI / 2 + (index * Math.PI * 2) / count;
  const point = (index: number, scale: number) => {
    const angle = angleFor(index);
    return {
      x: center + Math.cos(angle) * radius * scale,
      y: center + Math.sin(angle) * radius * scale,
    };
  };
  const pointsFor = (scale: number) =>
    attributes.map((_, index) => {
      const p = point(index, scale);
      return `${p.x},${p.y}`;
    }).join(' ');
  const dataPoints = attributes.map((attribute, index) => {
    const p = point(index, Math.max(0.015, Math.min(1, attribute.value / 100)));
    return p;
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="peritia-radar-fill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors.gold} stopOpacity={0.38} />
          <Stop offset="100%" stopColor={colors.teal} stopOpacity={0.12} />
        </LinearGradient>
      </Defs>
      <G>
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <Polygon
            key={scale}
            points={pointsFor(scale)}
            fill="none"
            stroke="rgba(255,255,255,0.075)"
            strokeWidth={1}
          />
        ))}
        {attributes.map((_, index) => {
          const p = point(index, 1);
          return (
            <Line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.055)"
              strokeWidth={1}
            />
          );
        })}
        <Polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="url(#peritia-radar-fill)"
          stroke={colors.gold}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        {dataPoints.map((p, index) => (
          <Circle
            key={`dot-${index}`}
            cx={p.x}
            cy={p.y}
            r={2.3}
            fill={colors.gold2}
            stroke={colors.bg}
            strokeWidth={1.4}
          />
        ))}
        {showLabels
          ? attributes.map((attribute, index) => {
              const p = point(index, 1.18);
              return (
                <SvgText
                  key={attribute.key}
                  x={p.x}
                  y={p.y + 3}
                  textAnchor="middle"
                  fill={colors.faint}
                  fontFamily={fonts.semibold}
                  fontSize={7.5}
                  letterSpacing={0.6}
                >
                  {attribute.short}
                </SvgText>
              );
            })
          : null}
      </G>
    </Svg>
  );
}
