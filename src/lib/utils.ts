import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ===========================================
// Class Name Utility
// ===========================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===========================================
// Date Utilities
// ===========================================

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return formatDate(d);
}

export function daysUntil(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

export function getMonthStart(): string {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  return firstDay.toISOString();
}

// ===========================================
// String Utilities
// ===========================================

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// ===========================================
// Color Utilities
// ===========================================

export const CARD_COLORS = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Violeta', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Amarillo', value: '#EAB308' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cian', value: '#06B6D4' },
  { name: 'Indigo', value: '#6366F1' },
] as const;

export function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ===========================================
// Number Utilities
// ===========================================

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}