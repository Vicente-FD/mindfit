import {
  DIAS_ALERTA_FLOTA,
  KM_ALERTA_ACEITE,
  EstadoVencimiento,
  Vehiculo,
} from '../models/flota.model';

export function diasHasta(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return Math.ceil((f.getTime() - hoy.getTime()) / 86_400_000);
}

export function estadoVencimiento(fecha: string | null): EstadoVencimiento {
  if (!fecha) return 'none';
  const d = diasHasta(fecha);
  if (d < 0) return 'danger';
  if (d <= DIAS_ALERTA_FLOTA) return 'warning';
  return 'ok';
}

export function alertaDocumento(fecha: string): boolean {
  return diasHasta(fecha) <= DIAS_ALERTA_FLOTA;
}

export function alertaAceite(
  kmActual: number,
  siguienteCambio: number,
): boolean {
  return siguienteCambio - kmActual <= KM_ALERTA_ACEITE;
}

export function alertasVehiculo(v: Vehiculo) {
  return {
    soap: alertaDocumento(v.vencimientoSoap),
    permiso: alertaDocumento(v.vencimientoPermiso),
    revision: alertaDocumento(v.vencimientoRevision),
    aceite: alertaAceite(v.kilometrajeActual, v.siguienteCambioAceiteKm),
  };
}

export function formatFechaCl(fecha: string): string {
  const iso = toIsoDateOnly(fecha);
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return fecha;
  return `${d}/${m}/${y}`;
}

/** Normaliza fechas API (ISO o YYYY-MM-DD) para el date-picker. */
export function toIsoDateOnly(fecha: string | null | undefined): string {
  if (!fecha) return '';
  return fecha.slice(0, 10);
}
