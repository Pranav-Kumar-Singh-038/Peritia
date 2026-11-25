const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  AED: 'د.إ',
};

export const CURRENCY_OPTIONS = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'JPY'];

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? `${code} `;
}

export function formatMoney(value: number, code: string, compact = false): string {
  const symbol = currencySymbol(code);
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (compact) {
    if (abs >= 1_000_000_000) return `${sign}${symbol}${trim(abs / 1_000_000_000)}B`;
    if (abs >= 1_000_000) return `${sign}${symbol}${trim(abs / 1_000_000)}M`;
    if (abs >= 1_000) return `${sign}${symbol}${trim(abs / 1_000)}K`;
  }
  return `${sign}${symbol}${Math.round(abs).toLocaleString()}`;
}

function trim(value: number): string {
  return value >= 10 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, '');
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatRatio(value: number, digits = 1): string {
  return `${value.toFixed(digits)}×`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number): number {
  return Math.round(value);
}

export function toRoman(value: number): string {
  const numerals: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remaining = value;
  let out = '';
  for (const [n, symbol] of numerals) {
    while (remaining >= n) {
      out += symbol;
      remaining -= n;
    }
  }
  return out;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return clamp(Math.round(value), 0, 100);
}
