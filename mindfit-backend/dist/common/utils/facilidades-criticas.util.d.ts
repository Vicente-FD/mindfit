import { EstadoFacilidadCritica, SemaforoOperatividadSede, TipoFacilidadCritica } from '../enums';
export declare const DEFAULT_TIPOS_FACILIDAD: TipoFacilidadCritica[];
export declare function labelTipoFacilidad(tipo: TipoFacilidadCritica): string;
export type AreaFacilidad = 'bano' | 'camarin' | 'ducha';
export type GeneroFacilidad = 'hombres' | 'mujeres';
export declare function resolveTipoFacilidad(area: AreaFacilidad, genero: GeneroFacilidad): TipoFacilidadCritica;
export declare function labelAreaGenero(area: AreaFacilidad, genero: GeneroFacilidad): string;
export declare function calcularSemaforoOperatividad(estados: EstadoFacilidadCritica[]): SemaforoOperatividadSede;
