import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CotizacionesVentasService } from './cotizaciones-ventas.service';
import { CreateCotizacionVentaDto } from './dto/create-cotizacion-venta.dto';
import { UpdateEstadoCotizacionDto } from './dto/update-estado-cotizacion.dto';
export declare class CotizacionesVentasController {
    private readonly cotizacionesService;
    constructor(cotizacionesService: CotizacionesVentasService);
    findAll(): Promise<import("../entities").CotizacionVenta[]>;
    findOne(id: number): Promise<import("../entities").CotizacionVenta>;
    create(dto: CreateCotizacionVentaDto, user: JwtPayload): Promise<import("../entities").CotizacionVenta>;
    actualizarEstado(id: number, dto: UpdateEstadoCotizacionDto): Promise<import("../entities").CotizacionVenta>;
}
