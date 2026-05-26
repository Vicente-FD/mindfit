import { CotizacionVenta } from './cotizacion-venta.entity';
import { Usuario } from './usuario.entity';
export type TipoHistorialCotizacion = 'creacion' | 'edicion' | 'cambio_estado';
export declare class CotizacionVentaHistorial {
    id: number;
    cotizacionId: number;
    cotizacion: CotizacionVenta;
    usuarioId: number | null;
    usuario: Usuario | null;
    tipo: TipoHistorialCotizacion;
    resumen: string;
    cambios: Record<string, unknown> | null;
    createdAt: Date;
}
