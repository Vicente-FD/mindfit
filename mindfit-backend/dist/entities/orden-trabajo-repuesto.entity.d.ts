import { OrdenTrabajo } from './orden-trabajo.entity';
import { Repuesto } from './repuesto.entity';
export declare class OrdenTrabajoRepuesto {
    id: number;
    ordenTrabajoId: number;
    ordenTrabajo: OrdenTrabajo;
    repuestoId: number;
    repuesto: Repuesto;
    cantidadUsada: number;
    costoUnitarioAplicado: string;
    createdAt: Date;
}
