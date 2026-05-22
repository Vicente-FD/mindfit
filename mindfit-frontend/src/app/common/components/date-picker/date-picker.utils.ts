import { DateRangeValue } from './date-picker.types';

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0);
}

export function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1, 12, 0, 0, 0);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function compareIso(a: string, b: string): number {
  return a.localeCompare(b);
}

export function formatDisplayDate(iso: string): string {
  const d = parseIsoDate(iso);
  return d.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDisplayMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
}

export function formatRangeDisplay(range: DateRangeValue): string {
  return `${formatDisplayDate(range.start)} – ${formatDisplayDate(range.end)}`;
}

export function getCalendarDays(viewMonth: Date): Date[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1, 12, 0, 0, 0);
  const startPad = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startPad, 12, 0, 0, 0);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12, 0, 0, 0));
  }
  return days;
}

export function isInRange(iso: string, start: string, end: string): boolean {
  return compareIso(iso, start) >= 0 && compareIso(iso, end) <= 0;
}

export interface RangePreset {
  id: string;
  label: string;
  range: DateRangeValue;
}

export function buildRangePresets(): RangePreset[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayIso = toIsoDate(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = toIsoDate(yesterday);

  const dayOfWeek = (today.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);

  const last30Start = new Date(today);
  last30Start.setDate(today.getDate() - 29);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0);

  return [
    { id: 'today', label: 'Hoy', range: { start: todayIso, end: todayIso } },
    { id: 'yesterday', label: 'Ayer', range: { start: yesterdayIso, end: yesterdayIso } },
    {
      id: 'week',
      label: 'Esta Semana',
      range: { start: toIsoDate(weekStart), end: todayIso },
    },
    {
      id: 'last30',
      label: 'Últimos 30 días',
      range: { start: toIsoDate(last30Start), end: todayIso },
    },
    {
      id: 'month',
      label: 'Este Mes',
      range: { start: toIsoDate(monthStart), end: todayIso },
    },
  ];
}

export const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const;

export const WEEKDAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'] as const;
