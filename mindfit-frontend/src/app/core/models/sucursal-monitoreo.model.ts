export interface MonitoreoSedeRef {
  sucursalId: number;
  sucursalNombre: string;
  sucursalSigla: string;
}

export const MONITOREO_GLOBAL_KEY = 'global';

export interface SucursalMonitoreoSalud {
  activosOperativos: number;
  activosFueraServicio: number;
  activosEnReparacion: number;
  porcentajeEfectividad: number;
  otsReportadas: number;
  otsResueltas: number;
}

export interface TrabajoEnCurso extends Partial<MonitoreoSedeRef> {
  ordenId: number;
  codigoOt: string;
  titulo: string;
  clasificacion: string;
  estado: string;
  tecnicoNombre: string | null;
  fechaInicioReal: string | null;
  minutosTranscurridos: number;
  tiempoTranscurridoLabel: string;
}

export interface HistorialInfra extends Partial<MonitoreoSedeRef> {
  ordenId: number;
  codigoOt: string;
  reporteOriginal: string;
  prioridad: string;
  clasificacion: string;
  fechaResolucion: string;
  comentarioCierre: string | null;
}

export interface HistorialMaquina extends Partial<MonitoreoSedeRef> {
  ordenId: number;
  codigoOt: string;
  titulo: string;
  activoId: number;
  activoNombre: string;
  activoCodigo: string | null;
  tipoMantenimiento: string;
  prioridad: string;
  fechaResolucion: string;
  comentarioCierre: string | null;
  fotoAntesUrl: string | null;
  fotoDespuesUrl: string | null;
}

export interface BitacoraTimelineItem extends Partial<MonitoreoSedeRef> {
  ordenId: number;
  codigoOt: string;
  titulo: string;
  clasificacion: string;
  tipoMantenimiento: string;
  prioridad: string;
  fechaEvento: string;
  tecnicoNombre: string | null;
  comentarioCierre: string | null;
  fotoAntesUrl: string | null;
  fotoDespuesUrl: string | null;
  activoNombre: string | null;
}

export interface SucursalMonitoreoResponse {
  sucursal: { id: number; nombre: string; sigla: string };
  salud: SucursalMonitoreoSalud;
  trabajosEnCurso: TrabajoEnCurso[];
  historialInfraestructura: HistorialInfra[];
  historialMaquinas: HistorialMaquina[];
  bitacoraTimeline: BitacoraTimelineItem[];
  consultadoEn: string;
}
