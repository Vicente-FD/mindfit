import type { AreaFacilidad, GeneroFacilidad } from '../models/facilidad-critica.model';

export type TipoElementoServicio =
  | 'wc'
  | 'urinarios'
  | 'lavamanos'
  | 'duchas'
  | 'lockers';

export type TipoFacilidadKey =
  | 'bano_hombres'
  | 'bano_mujeres'
  | 'camarin_hombres'
  | 'camarin_mujeres'
  | 'duchas_hombres'
  | 'duchas_mujeres';

export interface CapacidadElementos {
  wc?: number;
  urinarios?: number;
  lavamanos?: number;
  duchas?: number;
  lockers?: number;
}

export type CapacidadesServicios = Partial<
  Record<TipoFacilidadKey, CapacidadElementos>
>;

export interface ElementoAfectado {
  tipo_elemento: TipoElementoServicio;
  cantidad: number;
}

export const DEFAULT_CAPACIDADES: CapacidadesServicios = {
  bano_hombres: { wc: 4, urinarios: 3, lavamanos: 4 },
  bano_mujeres: { wc: 4, urinarios: 3, lavamanos: 4 },
  camarin_hombres: { lockers: 40 },
  camarin_mujeres: { lockers: 40 },
  duchas_hombres: { duchas: 6 },
  duchas_mujeres: { duchas: 6 },
};

export const LABEL_ELEMENTO: Record<TipoElementoServicio, string> = {
  wc: 'WC',
  urinarios: 'Urinarios',
  lavamanos: 'Lavamanos',
  duchas: 'Duchas',
  lockers: 'Lockers',
};

export const ELEMENTOS_POR_AREA: Record<
  AreaFacilidad,
  TipoElementoServicio[]
> = {
  bano: ['wc', 'urinarios', 'lavamanos'],
  camarin: ['lockers'],
  ducha: ['duchas'],
};

export function resolveTipoFacilidadKey(
  area: AreaFacilidad,
  genero: GeneroFacilidad,
): TipoFacilidadKey {
  const map: Record<AreaFacilidad, Record<GeneroFacilidad, TipoFacilidadKey>> = {
    bano: { hombres: 'bano_hombres', mujeres: 'bano_mujeres' },
    camarin: { hombres: 'camarin_hombres', mujeres: 'camarin_mujeres' },
    ducha: { hombres: 'duchas_hombres', mujeres: 'duchas_mujeres' },
  };
  return map[area][genero];
}

export function resolveCapacidades(
  raw?: CapacidadesServicios | null,
): CapacidadesServicios {
  const base = { ...DEFAULT_CAPACIDADES };
  if (!raw) return base;
  for (const k of Object.keys(base) as TipoFacilidadKey[]) {
    base[k] = { ...base[k], ...raw[k] };
  }
  return base;
}

export function capacidadMax(
  caps: CapacidadesServicios,
  tipo: TipoFacilidadKey,
  el: TipoElementoServicio,
): number {
  return Math.max(0, Number(caps[tipo]?.[el] ?? 0));
}

export function formatElementosLabel(elementos: ElementoAfectado[]): string {
  if (!elementos.length) return '';
  return elementos
    .map((e) => `${e.cantidad}x ${LABEL_ELEMENTO[e.tipo_elemento]}`)
    .join(', ');
}

export function buildCapacidadesFormValue(
  caps?: CapacidadesServicios | null,
): CapacidadesServicios {
  return resolveCapacidades(caps);
}

export function emptyElementosRecord(
  elementos: TipoElementoServicio[],
): Record<TipoElementoServicio, number> {
  const r = {} as Record<TipoElementoServicio, number>;
  for (const e of elementos) r[e] = 0;
  return r;
}

export const CAPACIDAD_SECCIONES: {
  key: TipoFacilidadKey;
  label: string;
  elementos: TipoElementoServicio[];
}[] = [
  {
    key: 'bano_hombres',
    label: 'Baños — Hombres',
    elementos: ['wc', 'urinarios', 'lavamanos'],
  },
  {
    key: 'bano_mujeres',
    label: 'Baños — Mujeres',
    elementos: ['wc', 'urinarios', 'lavamanos'],
  },
  {
    key: 'camarin_hombres',
    label: 'Camarines — Hombres',
    elementos: ['lockers'],
  },
  {
    key: 'camarin_mujeres',
    label: 'Camarines — Mujeres',
    elementos: ['lockers'],
  },
  {
    key: 'duchas_hombres',
    label: 'Duchas — Hombres',
    elementos: ['duchas'],
  },
  {
    key: 'duchas_mujeres',
    label: 'Duchas — Mujeres',
    elementos: ['duchas'],
  },
];
