export interface SucursalMonitoreoSaludDto {
  activosOperativos: number;
  activosFueraServicio: number;
  activosEnReparacion: number;
  porcentajeEfectividad: number;
  otsReportadas: number;
  otsResueltas: number;
}

export interface MonitoreoSedeRefDto {
  sucursalId: number;
  sucursalNombre: string;
  sucursalSigla: string;
}

export interface TrabajoEnCursoDto extends Partial<MonitoreoSedeRefDto> {
  ordenId: number;
  codigoOt: string;
  titulo: string;
  clasificacion: string;
  estado: string;
  tecnicoNombre: string | null;
  activoNombre: string | null;
  activoCodigo: string | null;
  fechaInicioReal: string | null;
  minutosTranscurridos: number;
  tiempoTranscurridoLabel: string;
}

export interface HistorialInfraDto extends Partial<MonitoreoSedeRefDto> {
  ordenId: number;
  codigoOt: string;
  reporteOriginal: string;
  prioridad: string;
  clasificacion: string;
  fechaResolucion: string;
  comentarioCierre: string | null;
}

export interface HistorialMaquinaDto extends Partial<MonitoreoSedeRefDto> {
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

export interface BitacoraTimelineItemDto extends Partial<MonitoreoSedeRefDto> {
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

export interface CotizacionPendienteMonitoreoDto {
  id: number;
  folio: string;
  clienteRazonSocial: string;
  ejecutivoNombre: string | null;
  montoBruto: number;
  divisaCodigo: string;
  createdAt: string;
}

export interface FacilidadCriticaMonitoreoItemDto {
  id: number;
  tipo: string;
  tipoLabel: string;
  estado: string;
  notasTecnicas: string | null;
  fallosHistoricos: number;
}

export interface FacilidadesCriticasMonitoreoDto {
  semaforo: string;
  operativas: number;
  degradadas: number;
  enMantenimiento: number;
  fueraDeServicio: number;
  items: FacilidadCriticaMonitoreoItemDto[];
}

export interface SedeSemaforoMonitoreoDto {
  sucursalId: number;
  sucursalNombre: string;
  sucursalSigla: string;
  semaforo: string;
  operativas: number;
  degradadas: number;
  enMantenimiento: number;
  fueraDeServicio: number;
}

export interface SucursalMonitoreoResponseDto {
  sucursal: {
    id: number;
    nombre: string;
    sigla: string;
  };
  salud: SucursalMonitoreoSaludDto;
  facilidadesCriticas: FacilidadesCriticasMonitoreoDto | null;
  sedesSemaforoFacilidades: SedeSemaforoMonitoreoDto[];
  trabajosEnCurso: TrabajoEnCursoDto[];
  cotizacionesPendientes: CotizacionPendienteMonitoreoDto[];
  historialInfraestructura: HistorialInfraDto[];
  historialMaquinas: HistorialMaquinaDto[];
  bitacoraTimeline: BitacoraTimelineItemDto[];
  consultadoEn: string;
}
