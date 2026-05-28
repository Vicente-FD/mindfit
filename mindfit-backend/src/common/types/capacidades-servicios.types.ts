import { TipoFacilidadCritica } from '../enums';

/** Elementos inventariados por tipo de facilidad. */
export type TipoElementoServicio =
  | 'wc'
  | 'urinarios'
  | 'lavamanos'
  | 'duchas'
  | 'lockers';

export interface CapacidadElementos {
  wc?: number;
  urinarios?: number;
  lavamanos?: number;
  duchas?: number;
  lockers?: number;
}

export type CapacidadesServicios = Partial<
  Record<TipoFacilidadCritica, CapacidadElementos>
>;

export interface ElementoAfectadoDto {
  tipo_elemento: TipoElementoServicio;
  cantidad: number;
}

/** Detalle estructurado por facilidad (OT multi-área o persistencia explícita). */
export interface ServicioAfectadoDetalleDto {
  tipoFacilidad: TipoFacilidadCritica;
  elementos: ElementoAfectadoDto[];
}

/** Payload JSONB en ordenes_trabajo.servicios_afectados (compatible con legacy string[]). */
export type ServiciosAfectadosPayload =
  | TipoFacilidadCritica[]
  | ElementoAfectadoDto[]
  | ServicioAfectadoDetalleDto[];

export const DEFAULT_CAPACIDADES_SERVICIOS: CapacidadesServicios = {
  [TipoFacilidadCritica.BANO_HOMBRES]: {
    wc: 4,
    urinarios: 3,
    lavamanos: 4,
  },
  [TipoFacilidadCritica.BANO_MUJERES]: {
    wc: 4,
    urinarios: 3,
    lavamanos: 4,
  },
  [TipoFacilidadCritica.CAMARIN_HOMBRES]: { lockers: 40 },
  [TipoFacilidadCritica.CAMARIN_MUJERES]: { lockers: 40 },
  [TipoFacilidadCritica.DUCHAS_HOMBRES]: { duchas: 6 },
  [TipoFacilidadCritica.DUCHAS_MUJERES]: { duchas: 6 },
};

export const ELEMENTOS_POR_FACILIDAD: Record<
  TipoFacilidadCritica,
  TipoElementoServicio[]
> = {
  [TipoFacilidadCritica.BANO_HOMBRES]: ['wc', 'urinarios', 'lavamanos'],
  [TipoFacilidadCritica.BANO_MUJERES]: ['wc', 'urinarios', 'lavamanos'],
  [TipoFacilidadCritica.CAMARIN_HOMBRES]: ['lockers'],
  [TipoFacilidadCritica.CAMARIN_MUJERES]: ['lockers'],
  [TipoFacilidadCritica.DUCHAS_HOMBRES]: ['duchas'],
  [TipoFacilidadCritica.DUCHAS_MUJERES]: ['duchas'],
};

export const TIPO_ELEMENTO_SERVICIO_VALUES: TipoElementoServicio[] = [
  'wc',
  'urinarios',
  'lavamanos',
  'duchas',
  'lockers',
];

export const LABEL_ELEMENTO_SERVICIO: Record<TipoElementoServicio, string> = {
  wc: 'WC',
  urinarios: 'Urinarios',
  lavamanos: 'Lavamanos',
  duchas: 'Duchas',
  lockers: 'Lockers',
};
