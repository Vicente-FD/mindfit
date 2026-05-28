import {
  EstadoFacilidadCritica,
  SemaforoOperatividadSede,
  TipoFacilidadCritica,
} from '../enums';

const TIPO_LABELS: Record<TipoFacilidadCritica, string> = {
  [TipoFacilidadCritica.BANO_HOMBRES]: 'Baños hombres',
  [TipoFacilidadCritica.BANO_MUJERES]: 'Baños mujeres',
  [TipoFacilidadCritica.CAMARIN_HOMBRES]: 'Camarines hombres',
  [TipoFacilidadCritica.CAMARIN_MUJERES]: 'Camarines mujeres',
  [TipoFacilidadCritica.DUCHAS_HOMBRES]: 'Duchas hombres',
  [TipoFacilidadCritica.DUCHAS_MUJERES]: 'Duchas mujeres',
};

export const DEFAULT_TIPOS_FACILIDAD: TipoFacilidadCritica[] = [
  TipoFacilidadCritica.BANO_HOMBRES,
  TipoFacilidadCritica.BANO_MUJERES,
  TipoFacilidadCritica.CAMARIN_HOMBRES,
  TipoFacilidadCritica.CAMARIN_MUJERES,
  TipoFacilidadCritica.DUCHAS_HOMBRES,
  TipoFacilidadCritica.DUCHAS_MUJERES,
];

export function labelTipoFacilidad(tipo: TipoFacilidadCritica): string {
  return TIPO_LABELS[tipo] ?? tipo;
}

export type AreaFacilidad = 'bano' | 'camarin' | 'ducha';
export type GeneroFacilidad = 'hombres' | 'mujeres';

const AREA_GENERO_TO_TIPO: Record<
  AreaFacilidad,
  Record<GeneroFacilidad, TipoFacilidadCritica>
> = {
  bano: {
    hombres: TipoFacilidadCritica.BANO_HOMBRES,
    mujeres: TipoFacilidadCritica.BANO_MUJERES,
  },
  camarin: {
    hombres: TipoFacilidadCritica.CAMARIN_HOMBRES,
    mujeres: TipoFacilidadCritica.CAMARIN_MUJERES,
  },
  ducha: {
    hombres: TipoFacilidadCritica.DUCHAS_HOMBRES,
    mujeres: TipoFacilidadCritica.DUCHAS_MUJERES,
  },
};

export function resolveTipoFacilidad(
  area: AreaFacilidad,
  genero: GeneroFacilidad,
): TipoFacilidadCritica {
  return AREA_GENERO_TO_TIPO[area][genero];
}

export function labelAreaGenero(
  area: AreaFacilidad,
  genero: GeneroFacilidad,
): string {
  const areaLabel =
    area === 'bano' ? 'Baños' : area === 'camarin' ? 'Camarines' : 'Duchas';
  const generoLabel = genero === 'hombres' ? 'hombres' : 'mujeres';
  return `${areaLabel} ${generoLabel}`;
}

export function calcularSemaforoOperatividad(
  estados: EstadoFacilidadCritica[],
): SemaforoOperatividadSede {
  if (
    estados.some((e) => e === EstadoFacilidadCritica.FUERA_DE_SERVICIO)
  ) {
    return SemaforoOperatividadSede.ROJO;
  }
  if (
    estados.some(
      (e) =>
        e === EstadoFacilidadCritica.DEGRADADO ||
        e === EstadoFacilidadCritica.MANTENIMIENTO,
    )
  ) {
    return SemaforoOperatividadSede.AMARILLO;
  }
  return SemaforoOperatividadSede.VERDE;
}
