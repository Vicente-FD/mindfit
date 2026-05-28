export type AreaFacilidad = 'bano' | 'camarin' | 'ducha';
export type GeneroFacilidad = 'hombres' | 'mujeres';

export type EstadoFacilidadCritica =
  | 'operativo'
  | 'mantenimiento'
  | 'fuera_de_servicio';

export type SemaforoOperatividadSede = 'verde' | 'amarillo' | 'rojo';

export interface FacilidadCriticaItem {
  id: number;
  sucursalId: number;
  tipo: string;
  tipoLabel: string;
  estado: EstadoFacilidadCritica;
  notasTecnicas: string | null;
  updatedAt: string;
  fallosHistoricos: number;
}

export interface FacilidadesResumen {
  semaforo: SemaforoOperatividadSede;
  operativas: number;
  enMantenimiento: number;
  fueraDeServicio: number;
  items: FacilidadCriticaItem[];
}

export interface SedeSemaforoResumen {
  sucursalId: number;
  sucursalNombre: string;
  sucursalSigla: string;
  semaforo: SemaforoOperatividadSede;
  operativas: number;
  enMantenimiento: number;
  fueraDeServicio: number;
}

export interface FacilidadHistorialItem {
  id: number;
  estadoAnterior: EstadoFacilidadCritica;
  estadoNuevo: EstadoFacilidadCritica;
  descripcionProblema: string | null;
  reportadoPorNombre: string | null;
  createdAt: string;
}
