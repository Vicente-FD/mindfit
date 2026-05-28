import { ClasificacionOrden, EstadoFacilidadCritica, EstadoOrdenTrabajo, SemaforoOperatividadSede, TipoFacilidadCritica } from '../enums';
import { CapacidadElementos, CapacidadesServicios, ElementoAfectadoDto, ServiciosAfectadosPayload, TipoElementoServicio } from '../types/capacidades-servicios.types';
export declare const ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS: EstadoOrdenTrabajo[];
export interface OtServiciosContext {
    id: number;
    clasificacion: ClasificacionOrden;
    estado: EstadoOrdenTrabajo;
    sucursalId: number;
    fallaGeneralServicios: boolean;
    areaServicios: 'bano' | 'camarin' | 'ducha' | null;
    generoServicios: 'hombres' | 'mujeres' | null;
    facilidadCriticaId?: number | null;
    serviciosAfectados?: ServiciosAfectadosPayload | null;
    facilidadCriticaTipo?: TipoFacilidadCritica | null;
}
export declare function resolveCapacidadesSucursal(raw: CapacidadesServicios | null | undefined): CapacidadesServicios;
export declare function capacidadElemento(capacidades: CapacidadesServicios, tipo: TipoFacilidadCritica, elemento: TipoElementoServicio): number;
export declare function inferTiposFacilidadOt(orden: OtServiciosContext): TipoFacilidadCritica[];
export declare function sumarElementosEnFalla(ots: OtServiciosContext[], tipoFacilidad: TipoFacilidadCritica, excluirOtId?: number): Map<TipoElementoServicio, number>;
export declare function extraerElementosOt(ot: OtServiciosContext, tipoFacilidad: TipoFacilidadCritica): ElementoAfectadoDto[];
export declare function calcularEstadoFacilidadPorCapacidad(tipoFacilidad: TipoFacilidadCritica, capacidades: CapacidadesServicios, otsAbiertas: OtServiciosContext[], excluirOtId?: number): EstadoFacilidadCritica;
export declare function calcularSemaforoOperatividadExtendido(estados: EstadoFacilidadCritica[]): SemaforoOperatividadSede;
export declare function parseElementosAfectadosJson(raw?: string): ElementoAfectadoDto[];
export declare function formatElementosFallaLabel(elementos: ElementoAfectadoDto[]): string;
export declare function mergeCapacidadElementos(a: CapacidadElementos, b: CapacidadElementos): CapacidadElementos;
