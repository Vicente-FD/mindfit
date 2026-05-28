import type {
  EstadoFacilidadCritica,
  SemaforoOperatividadSede,
} from '../models/facilidad-critica.model';

export function labelEstadoFacilidad(estado: EstadoFacilidadCritica): string {
  const map: Record<EstadoFacilidadCritica, string> = {
    operativo: 'Operativo',
    mantenimiento: 'Mantenimiento',
    fuera_de_servicio: 'Fuera de servicio',
  };
  return map[estado] ?? estado;
}

export function semaforoClass(semaforo: SemaforoOperatividadSede): string {
  return `fc-semaforo--${semaforo}`;
}

export function estadoFacilidadClass(estado: EstadoFacilidadCritica): string {
  return `fc-estado--${estado.replace(/_/g, '-')}`;
}

export function semaforoLabel(semaforo: SemaforoOperatividadSede): string {
  const map: Record<SemaforoOperatividadSede, string> = {
    verde: 'Operativo',
    amarillo: 'Atención',
    rojo: 'Crítico',
  };
  return map[semaforo] ?? semaforo;
}
