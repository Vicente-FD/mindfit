import { EstadoOrdenTrabajo, PrioridadOrden, TipoMantenimiento } from '../../common/enums';
export declare class UpdateOrdenTrabajoDto {
    activoId?: number;
    titulo?: string;
    descripcion?: string;
    prioridad?: PrioridadOrden;
    tipoMantenimiento?: TipoMantenimiento;
    estado?: EstadoOrdenTrabajo;
    tiempoEstimadoMinutos?: number;
    fechaProgramacion?: string;
    motivoRechazo?: string;
}
