import { InventarioService } from './inventario.service';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { FilterBodegaDto } from './dto/filter-bodega.dto';
import { AjustarStockDto } from './dto/ajustar-stock.dto';
import { IngresoStockDto } from './dto/ingreso-stock.dto';
export declare class InventarioController {
    private readonly inventario;
    constructor(inventario: InventarioService);
    listRepuestos(): Promise<import("../entities").Repuesto[]>;
    repuestosDisponibles(): Promise<import("./inventario.service").RepuestoDisponibleDto[]>;
    createRepuesto(dto: CreateRepuestoDto): Promise<import("../entities").Repuesto>;
    updateRepuesto(id: number, dto: UpdateRepuestoDto): Promise<import("../entities").Repuesto>;
    listStock(query: FilterBodegaDto): Promise<import("../entities").BodegaStock[]>;
    getKpis(): Promise<{
        totalSku: number;
        valorizacionInventario: number;
        alertasReorden: number;
    }>;
    ajustarStock(id: number, dto: AjustarStockDto): Promise<import("../entities").BodegaStock>;
    registrarIngreso(id: number, dto: IngresoStockDto): Promise<import("../entities").BodegaStock>;
    asegurarFilaStock(repuestoId: number): Promise<import("../entities").BodegaStock>;
}
