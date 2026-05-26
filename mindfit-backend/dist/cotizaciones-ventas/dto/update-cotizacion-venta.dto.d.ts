import { DivisaCodigo } from '../../common/enums';
import { CotizacionDetalleItemDto } from './cotizacion-detalle-item.dto';
export declare class UpdateCotizacionVentaDto {
    divisaCodigo?: DivisaCodigo;
    tasaCambioClp?: number;
    subtotalNeto?: number;
    montoIva?: number;
    montoBruto?: number;
    comentariosComerciales?: string;
    detalles?: CotizacionDetalleItemDto[];
}
