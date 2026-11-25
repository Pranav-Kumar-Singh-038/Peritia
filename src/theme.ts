import { Platform } from 'react-native';

export const colors = {
  bg: '#080b10',
  bgDeep: '#05070a',
  surface: '#121924',
  surface2: '#17202d',
  surface3: '#1b2636',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#f2f5f8',
  muted: '#8e9aab',
  faint: '#5e6a7a',
  gold: '#e9b872',
  gold2: '#f6d9a8',
  goldDeep: '#b8863b',
  teal: '#5eead4',
  violet: '#a78bfa',
  rose: '#fb7185',
  green: '#34d399',
  blue: '#60a5fa',
  danger: '#fb7185',
  white: '#ffffff',
  black: '#000000',
  goldSoft: 'rgba(233,184,114,0.10)',
  goldBorder: 'rgba(233,184,114,0.22)',
  tealSoft: 'rgba(94,234,212,0.10)',
  tealBorder: 'rgba(94,234,212,0.22)',
  violetSoft: 'rgba(167,139,250,0.10)',
  violetBorder: 'rgba(167,139,250,0.22)',
  roseSoft: 'rgba(251,113,133,0.10)',
  roseBorder: 'rgba(251,113,133,0.22)',
  greenSoft: 'rgba(52,211,153,0.10)',
  greenBorder: 'rgba(52,211,153,0.22)',
  overlay: 'rgba(3,5,8,0.82)',
};

export const fonts = {
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semibold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const shadows = {
  card: Platform.select({
    android: { elevation: 3 },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.24,
      shadowRadius: 24,
    },
  }),
  gold: Platform.select({
    android: { elevation: 5 },
    default: {
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.24,
      shadowRadius: 16,
    },
  }),
};

export const type = {
  display: {
    fontFamily: fonts.displayBold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: fonts.semibold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: fonts.regular,
    color: colors.text,
    letterSpacing: -0.1,
  },
  label: {
    fontFamily: fonts.semibold,
    color: colors.muted,
    letterSpacing: 1.3,
    textTransform: 'uppercase' as const,
  },
  number: {
    fontFamily: fonts.displayBold,
    color: colors.gold2,
    letterSpacing: -1,
  },
};

export const difficultyColor = {
  easy: colors.teal,
  medium: colors.gold,
  hard: colors.rose,
};

export const difficultyLabel = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};
