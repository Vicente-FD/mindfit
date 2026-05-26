import { Vehiculo } from '../entities/vehiculo.entity';

export const DIAS_ALERTA_VENCIMIENTO = 30;
export const KM_ALERTA_ACEITE = 1000;

export interface AlertasVehiculo {
  soap: boolean;
  permiso: boolean;
  revision: boolean;
  aceite: boolean;
}

export function diasHastaVencimiento(fecha: string | Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return Math.ceil((f.getTime() - hoy.getTime()) / 86_400_000);
}

export function alertaPorFecha(fecha: string | Date): boolean {
  return diasHastaVencimiento(fecha) <= DIAS_ALERTA_VENCIMIENTO;
}

export function alertaPorAceite(v: Pick<Vehiculo, 'kilometrajeActual' | 'siguienteCambioAceiteKm'>): boolean {
  return v.siguienteCambioAceiteKm - v.kilometrajeActual <= KM_ALERTA_ACEITE;
}

export function calcularAlertasVehiculo(v: Vehiculo): AlertasVehiculo {
  return {
    soap: alertaPorFecha(v.vencimientoSoap),
    permiso: alertaPorFecha(v.vencimientoPermiso),
    revision: alertaPorFecha(v.vencimientoRevision),
    aceite: alertaPorAceite(v),
  };
}

export function vehiculoRequiereAtencion(v: Vehiculo): boolean {
  const a = calcularAlertasVehiculo(v);
  return a.soap || a.permiso || a.revision || a.aceite;
}
