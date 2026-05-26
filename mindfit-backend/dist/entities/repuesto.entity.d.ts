import { BodegaStock } from './bodega-stock.entity';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { OrdenTrabajoRepuesto } from './orden-trabajo-repuesto.entity';
export declare class Repuesto {
    id: number;
    sku: string;
    nombre: string;
    descripcion: string | null;
    costoUnitario: string;
    aptoParaVenta: boolean;
    precioVentaClp: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    stocks: BodegaStock[];
    movimientos: MovimientoInventario[];
    consumos: OrdenTrabajoRepuesto[];
}
