import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { lastNDays } from '../utils/date';

const CELL = 11;
const GAP = 3;

export function Heatmap({
  counts,
  weeks = 12,
  showLegend = true,
}: {
  counts: Record<string, number>;
  weeks?: number;
  showLegend?: boolean;
}) {
  const days = lastNDays(weeks * 7);
  const columns: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  const colorFor = (count: number) => {
    if (count <= 0) return 'rgba(255,255,255,0.045)';
    if (count === 1) return 'rgba(233,184,114,0.24)';
    if (count === 2) return 'rgba(233,184,114,0.46)';
    if (count === 3) return 'rgba(233,184,114,0.7)';
    return colors.gold2;
  };

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.weekdayColumn}>
          {['M', '', 'W', '', 'F', '', 'S'].map((label, index) => (
            <Text key={`${label}-${index}`} style={styles.weekday}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {columns.map((column, columnIndex) => (
            <View key={`col-${columnIndex}`} style={styles.column}>
              {column.map((day) => (
                <View
                  key={day}
                  style={[styles.cell, { backgroundColor: colorFor(counts[day] ?? 0) }]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
      {showLegend ? (
        <View style={styles.legend}>
          <Text style={styles.legendText}>Less</Text>
          {[0, 1, 2, 3, 4].map((level) => (
            <View key={level} style={[styles.legendCell, { backgroundColor: colorFor(level) }]} />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 7,
  },
  weekdayColumn: {
    paddingTop: 0,
    gap: GAP,
  },
  weekday: {
    height: CELL,
    lineHeight: CELL,
    fontFamily: fonts.medium,
    fontSize: 6.5,
    color: colors.faint,
    textAlign: 'center',
    width: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: GAP,
  },
  column: {
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 2.5,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 9,
  },
  legendCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: 7,
    color: colors.faint,
    marginHorizontal: 2,
  },
});
