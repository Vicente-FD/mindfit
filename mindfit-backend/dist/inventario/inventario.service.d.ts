import { DataSource, EntityManager } from 'typeorm';
import { Repuesto } from '../entities/repuesto.entity';
import { BodegaStock } from '../entities/bodega-stock.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { FilterBodegaDto } from './dto/filter-bodega.dto';
import { RepuestoConsumoItemDto } from './dto/repuesto-consumo.dto';
export interface RepuestoDisponibleDto {
    repuestoId: number;
    stockId: number;
    sku: string;
    nombre: string;
    costoUnitario: number;
    cantidadActual: number;
    cantidadMinimaAlerta: number;
}
export declare class InventarioService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findAllRepuestos(): Promise<Repuesto[]>;
    findRepuesto(id: number): Promise<Repuesto>;
    createRepuesto(dto: CreateRepuestoDto): Promise<Repuesto>;
    updateRepuesto(id: number, dto: UpdateRepuestoDto): Promise<Repuesto>;
    findStock(filters?: FilterBodegaDto): Promise<BodegaStock[]>;
    getKpis(): Promise<{
        totalSku: number;
        valorizacionInventario: number;
        alertasReorden: number;
    }>;
    listRepuestosDisponibles(): Promise<RepuestoDisponibleDto[]>;
    asegurarStock(repuestoId: number): Promise<BodegaStock>;
    ajustarStock(stockId: number, cantidadActual: number): Promise<BodegaStock>;
    registrarIngreso(stockId: number, cantidad: number): Promise<BodegaStock>;
    procesarConsumoEnTransaccion(manager: EntityManager, ordenTrabajoId: number, items: RepuestoConsumoItemDto[]): Promise<number>;
}
