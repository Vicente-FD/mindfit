import { EstadoFacilidadCritica, SemaforoOperatividadSede, TipoFacilidadCritica } from '../../common/enums';
export interface FacilidadCriticaItemDto {
    id: number;
    sucursalId: number;
    tipo: TipoFacilidadCritica;
    tipoLabel: string;
    estado: EstadoFacilidadCritica;
    notasTecnicas: string | null;
    updatedAt: string;
    fallosHistoricos: number;
}
export interface FacilidadHistorialItemDto {
    id: number;
    estadoAnterior: EstadoFacilidadCritica;
    estadoNuevo: EstadoFacilidadCritica;
    descripcionProblema: string | null;
    reportadoPorNombre: string | null;
    createdAt: string;
}
export interface FacilidadesResumenDto {
    semaforo: SemaforoOperatividadSede;
    operativas: number;
    degradadas: number;
    enMantenimiento: number;
    fueraDeServicio: number;
    items: FacilidadCriticaItemDto[];
}
export interface SedeSemaforoResumenDto {
    sucursalId: number;
    sucursalNombre: string;
    sucursalSigla: string;
    semaforo: SemaforoOperatividadSede;
    operativas: number;
    degradadas: number;
    enMantenimiento: number;
    fueraDeServicio: number;
}
export interface ReportarAreaServiciosResultDto {
    ordenId: number;
    codigoOt: string;
    titulo: string;
    facilidadCriticaId: number | null;
    esFallaGeneral: boolean;
}
