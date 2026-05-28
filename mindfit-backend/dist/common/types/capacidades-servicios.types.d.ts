import { TipoFacilidadCritica } from '../enums';
export type TipoElementoServicio = 'wc' | 'urinarios' | 'lavamanos' | 'duchas' | 'lockers';
export interface CapacidadElementos {
    wc?: number;
    urinarios?: number;
    lavamanos?: number;
    duchas?: number;
    lockers?: number;
}
export type CapacidadesServicios = Partial<Record<TipoFacilidadCritica, CapacidadElementos>>;
export interface ElementoAfectadoDto {
    tipo_elemento: TipoElementoServicio;
    cantidad: number;
}
export interface ServicioAfectadoDetalleDto {
    tipoFacilidad: TipoFacilidadCritica;
    elementos: ElementoAfectadoDto[];
}
export type ServiciosAfectadosPayload = TipoFacilidadCritica[] | ElementoAfectadoDto[] | ServicioAfectadoDetalleDto[];
export declare const DEFAULT_CAPACIDADES_SERVICIOS: CapacidadesServicios;
export declare const ELEMENTOS_POR_FACILIDAD: Record<TipoFacilidadCritica, TipoElementoServicio[]>;
export declare const TIPO_ELEMENTO_SERVICIO_VALUES: TipoElementoServicio[];
export declare const LABEL_ELEMENTO_SERVICIO: Record<TipoElementoServicio, string>;
