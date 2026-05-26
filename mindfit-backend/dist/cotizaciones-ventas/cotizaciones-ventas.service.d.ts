import { DataSource } from 'typeorm';
import { CotizacionVenta } from '../entities/cotizacion-venta.entity';
import { ClientesService } from '../clientes/clientes.service';
import { DivisasService } from '../divisas/divisas.service';
import { CreateCotizacionVentaDto } from './dto/create-cotizacion-venta.dto';
import { UpdateEstadoCotizacionDto } from './dto/update-estado-cotizacion.dto';
export declare class CotizacionesVentasService {
    private readonly dataSource;
    private readonly clientesService;
    private readonly divisasService;
    constructor(dataSource: DataSource, clientesService: ClientesService, divisasService: DivisasService);
    private repo;
    findAll(): Promise<CotizacionVenta[]>;
    findOne(id: number): Promise<CotizacionVenta>;
    create(dto: CreateCotizacionVentaDto, creadoPorId: number): Promise<CotizacionVenta>;
    actualizarEstado(id: number, dto: UpdateEstadoCotizacionDto): Promise<CotizacionVenta>;
    private generarFolio;
    private procesarDetallesActivos;
    private procesarLineaActivo;
}
