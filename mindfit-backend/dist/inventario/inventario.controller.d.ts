import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { InventarioService } from './inventario.service';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { FilterBodegaDto } from './dto/filter-bodega.dto';
import { AjustarStockDto } from './dto/ajustar-stock.dto';
import { IngresoStockDto } from './dto/ingreso-stock.dto';
import { BodegaAjusteDto } from './dto/bodega-ajuste.dto';
import { UpdateMaquinaVentaDto } from './dto/update-maquina-venta.dto';
export declare class InventarioController {
    private readonly inventario;
    constructor(inventario: InventarioService);
    listRepuestos(): Promise<import("../entities").Repuesto[]>;
    repuestosDisponibles(): Promise<import("./inventario.service").RepuestoDisponibleDto[]>;
    createRepuesto(dto: CreateRepuestoDto): Promise<import("../entities").Repuesto>;
    getTrazabilidad(id: number, sucursalId?: string): Promise<import("./inventario.service").MovimientoTrazabilidadDto[]>;
    updateRepuesto(id: number, dto: UpdateRepuestoDto): Promise<import("../entities").Repuesto>;
    removeRepuesto(id: number): Promise<{
        deleted: boolean;
    }>;
    registrarAjuste(dto: BodegaAjusteDto, user: JwtPayload): Promise<import("../entities").BodegaStock>;
    listStock(query: FilterBodegaDto): Promise<import("../entities").BodegaStock[]>;
    getKpis(): Promise<{
        totalSku: number;
        valorizacionInventario: number;
        alertasReorden: number;
    }>;
    listMaquinasBodega(busqueda?: string): Promise<import("./inventario.service").BodegaMaquinaDto[]>;
    updateMaquinaVentaComercial(id: number, dto: UpdateMaquinaVentaDto): Promise<import("./inventario.service").BodegaMaquinaDto>;
    ajustarStock(id: number, dto: AjustarStockDto): Promise<import("../entities").BodegaStock>;
    registrarIngreso(id: number, dto: IngresoStockDto): Promise<import("../entities").BodegaStock>;
    asegurarFilaStock(repuestoId: number): Promise<import("../entities").BodegaStock>;
}
