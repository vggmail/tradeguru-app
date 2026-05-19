import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, symbol = '$'): string {
  const abs = Math.abs(value);
  const formatted = abs >= 1000
    ? (abs / 1000).toFixed(1) + 'k'
    : abs.toFixed(2);
  return (value < 0 ? '-' : '+') + symbol + formatted;
}

export function formatPct(value: number): string {
  return (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
}

export function scoreColor(score: number): string {
  if (score >= 75) return '#26a69a';
  if (score >= 50) return '#f7b500';
  return '#ef5350';
}

export function emotionLabel(e: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    calm:      { label: '😌 Calm',      color: '#26a69a' },
    focused:   { label: '🎯 Focused',   color: '#2962ff' },
    frustrated:{ label: '😤 Frustrated',color: '#ef5350' },
    fearful:   { label: '😨 Fearful',   color: '#f7b500' },
    revenge:   { label: '😡 Revenge',   color: '#ef5350' },
    fomo:      { label: '😰 FOMO',      color: '#ff9800' },
    excited:   { label: '🤩 Excited',   color: '#9c27b0' },
    impulsive: { label: '⚡ Impulsive', color: '#ff9800' },
  };
  return map[e] ?? { label: e, color: '#787b86' };
}
