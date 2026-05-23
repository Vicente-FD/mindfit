import { WorkOrder } from '../models/work-order.model';

export type OtDayLabelType =
  | 'reportado_finalizado'
  | 'reportado'
  | 'finalizado'
  | 'trabajando';

export const OT_DAY_LABEL_TEXT: Record<OtDayLabelType, string> = {
  reportado_finalizado: 'Reportado/Finalizado',
  reportado: 'Reportado',
  finalizado: 'Finalizado',
  trabajando: 'Trabajando',
};

export function toDateKey(iso: string | Date | null | undefined): string | null {
  if (!iso) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayDateKey(): string {
  return toDateKey(new Date())!;
}

export function getOtDayLabel(
  ot: WorkOrder,
  dayKey: string,
  todayKey: string = todayDateKey(),
): OtDayLabelType | null {
  const reportKey = toDateKey(ot.createdAt);
  const inicioKey = toDateKey(ot.fechaInicioReal);
  const finKey = toDateKey(ot.fechaFinReal);

  if (reportKey === dayKey && finKey === dayKey) {
    return 'reportado_finalizado';
  }
  if (reportKey === dayKey && finKey !== dayKey) {
    return 'reportado';
  }
  if (finKey === dayKey && reportKey !== dayKey) {
    return 'finalizado';
  }

  if (!inicioKey) return null;
  if (dayKey === reportKey || dayKey === finKey) return null;

  const dayMs = new Date(`${dayKey}T12:00:00`).getTime();
  const inicioMs = new Date(`${inicioKey}T12:00:00`).getTime();

  if (dayMs <= inicioMs) return null;

  if (finKey) {
    const finMs = new Date(`${finKey}T12:00:00`).getTime();
    if (dayMs >= finMs) return null;
    return 'trabajando';
  }

  const todayMs = new Date(`${todayKey}T12:00:00`).getTime();
  if (dayMs <= todayMs) return 'trabajando';
  return null;
}

export function calcDiasTotalesTrabajo(
  ot: WorkOrder,
  todayKey: string = todayDateKey(),
): number {
  const startKey = toDateKey(ot.fechaInicioReal) ?? toDateKey(ot.createdAt);
  if (!startKey) return 0;
  const endKey = toDateKey(ot.fechaFinReal) ?? todayKey;
  const startMs = new Date(`${startKey}T12:00:00`).getTime();
  const endMs = new Date(`${endKey}T12:00:00`).getTime();
  const diffDays = Math.round((endMs - startMs) / 86_400_000);
  return Math.max(1, diffDays + 1);
}

export interface CalendarDayEntry {
  ot: WorkOrder;
  label: OtDayLabelType;
  labelText: string;
}

export interface CalendarDayCell {
  day: number | null;
  dateKey: string | null;
  isToday: boolean;
  entries: CalendarDayEntry[];
}

export function buildCalendarGrid(
  mes: string,
  ordenes: WorkOrder[],
  todayKey: string = todayDateKey(),
): CalendarDayCell[] {
  const [year, month] = mes.split('-').map(Number);
  const monthIndex = month - 1;
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mesPrefix = `${year}-${String(month).padStart(2, '0')}`;

  const cells: CalendarDayCell[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null, dateKey: null, isToday: false, entries: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${mesPrefix}-${String(d).padStart(2, '0')}`;
    const entries: CalendarDayEntry[] = [];

    for (const ot of ordenes) {
      const label = getOtDayLabel(ot, dateKey, todayKey);
      if (!label) continue;
      entries.push({
        ot,
        label,
        labelText: OT_DAY_LABEL_TEXT[label],
      });
    }

    cells.push({
      day: d,
      dateKey,
      isToday: dateKey === todayKey,
      entries,
    });
  }

  return cells;
}

export function mesLabelFromKey(mes: string): string {
  const [y, m] = mes.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
}

export function currentMesKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function activoResumenOt(ot: WorkOrder): string {
  if (ot.clasificacion === 'infraestructura' || !ot.activo) {
    return 'Infraestructura';
  }
  const marca = ot.activo.marca?.trim();
  const modelo = ot.activo.modelo?.trim();
  const partes = [ot.activo.nombre];
  if (marca) partes.push(marca);
  if (modelo) partes.push(modelo);
  return partes.join(' · ');
}

export function tecnicoResumenOt(ot: WorkOrder): string {
  const t = ot.tecnicoAsignado ?? ot.asignadoA;
  if (!t) return 'Sin asignar';
  return t.rol ? `${t.nombre} (${t.rol})` : t.nombre;
}

export const ESTADO_OT_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  asignada: 'Asignada',
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

export const PRIORIDAD_OT_LABEL: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};
