import { PrioridadOrden, TipoMantenimiento } from '../../common/enums';
export declare class CreateOrdenTrabajoDto {
    activoId?: number;
    sucursalId: number;
    titulo: string;
    descripcion?: string;
    prioridad?: PrioridadOrden;
    tipoMantenimiento: TipoMantenimiento;
    tiempoEstimadoMinutos?: number;
    fechaProgramacion?: string;
}
