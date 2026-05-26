import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CotizacionesVentasService } from './cotizaciones-ventas.service';
import { CreateCotizacionVentaDto } from './dto/create-cotizacion-venta.dto';
import { UpdateEstadoCotizacionDto } from './dto/update-estado-cotizacion.dto';
import { UpdateCotizacionVentaDto } from './dto/update-cotizacion-venta.dto';
export declare class CotizacionesVentasController {
    private readonly cotizacionesService;
    constructor(cotizacionesService: CotizacionesVentasService);
    findAll(): Promise<import("../entities").CotizacionVenta[]>;
    getHistorial(id: number): Promise<import("../entities").CotizacionVentaHistorial[]>;
    findOne(id: number): Promise<import("../entities").CotizacionVenta>;
    create(dto: CreateCotizacionVentaDto, user: JwtPayload): Promise<import("../entities").CotizacionVenta>;
    update(id: number, dto: UpdateCotizacionVentaDto, user: JwtPayload): Promise<import("../entities").CotizacionVenta>;
    actualizarEstado(id: number, dto: UpdateEstadoCotizacionDto, user: JwtPayload): Promise<import("../entities").CotizacionVenta>;
}
