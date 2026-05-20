import { ClasificacionOrden, PrioridadOrden } from '../../common/enums';
export declare class UpdateOrdenTrabajoDto {
    titulo?: string;
    descripcion?: string;
    prioridad?: PrioridadOrden;
    clasificacion?: ClasificacionOrden;
    activoId?: number | null;
    asignadoAId?: number | null;
}
