import { BodegaStock } from './bodega-stock.entity';
import { OrdenTrabajoRepuesto } from './orden-trabajo-repuesto.entity';
export declare class Repuesto {
    id: number;
    sku: string;
    nombre: string;
    descripcion: string | null;
    costoUnitario: string;
    createdAt: Date;
    updatedAt: Date;
    stocks: BodegaStock[];
    consumos: OrdenTrabajoRepuesto[];
}
