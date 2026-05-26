import { Activo } from './activo.entity';
import { Repuesto } from './repuesto.entity';
import { CotizacionVenta } from './cotizacion-venta.entity';
export declare class CotizacionVentasDetalle {
    id: number;
    cotizacionId: number;
    cotizacion: CotizacionVenta;
    activoId: number | null;
    activo: Activo | null;
    repuestoId: number | null;
    repuesto: Repuesto | null;
    skuEstatico: string;
    nombreEstatico: string;
    categoriaEstatica: string | null;
    cantidad: number;
    precioUnitarioPactado: string;
    totalLineaNeto: string;
    costoHistoricoClp: string;
}
