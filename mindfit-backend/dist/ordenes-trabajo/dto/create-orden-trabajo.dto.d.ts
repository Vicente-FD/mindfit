import { ClasificacionOrden, PrioridadOrden, TipoMantenimiento } from '../../common/enums';
export declare class CreateOrdenTrabajoDto {
    clasificacion?: ClasificacionOrden;
    activoId?: number;
    sucursalId: number;
    titulo: string;
    descripcion?: string;
    prioridad?: PrioridadOrden;
    tipoMantenimiento: TipoMantenimiento;
    tiempoEstimadoMinutos?: number;
    fechaProgramacion?: string;
    facilidadCriticaId?: number;
    areaServicios?: 'bano' | 'camarin' | 'ducha';
    generoServicios?: 'hombres' | 'mujeres';
    fallaGeneralServicios?: boolean;
    serviciosAfectados?: string[];
}
