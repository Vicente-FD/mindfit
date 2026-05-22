import { DataSource, EntityManager } from 'typeorm';
import { TipoMovimientoInventario } from '../common/enums';
import { Repuesto } from '../entities/repuesto.entity';
import { BodegaStock } from '../entities/bodega-stock.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { FilterBodegaDto } from './dto/filter-bodega.dto';
import { RepuestoConsumoItemDto } from './dto/repuesto-consumo.dto';
import { BodegaAjusteDto } from './dto/bodega-ajuste.dto';
export interface RepuestoDisponibleDto {
    repuestoId: number;
    stockId: number;
    sku: string;
    nombre: string;
    costoUnitario: number;
    cantidadActual: number;
    cantidadMinimaAlerta: number;
}
export interface MovimientoTrazabilidadDto {
    id: number;
    tipoMovimiento: TipoMovimientoInventario;
    cantidad: number;
    costoUnitarioMomento: number;
    motivo: string;
    createdAt: Date;
    sucursalId: number;
    sucursalNombre: string;
    sucursalSigla: string;
    usuarioNombre: string;
    ordenTrabajoId: number | null;
    codigoOt: string | null;
    ordenTitulo: string | null;
    activoNombre: string | null;
    esEntrada: boolean;
}
export declare class InventarioService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findAllRepuestos(): Promise<Repuesto[]>;
    findRepuesto(id: number): Promise<Repuesto>;
    createRepuesto(dto: CreateRepuestoDto): Promise<Repuesto>;
    updateRepuesto(id: number, dto: UpdateRepuestoDto): Promise<Repuesto>;
    softDeleteRepuesto(id: number): Promise<{
        deleted: boolean;
    }>;
    findStock(filters?: FilterBodegaDto): Promise<BodegaStock[]>;
    getKpis(): Promise<{
        totalSku: number;
        valorizacionInventario: number;
        alertasReorden: number;
    }>;
    listRepuestosDisponibles(): Promise<RepuestoDisponibleDto[]>;
    asegurarStock(repuestoId: number): Promise<BodegaStock>;
    registrarAjuste(dto: BodegaAjusteDto, usuarioId: number): Promise<BodegaStock>;
    ajustarStock(stockId: number, cantidadActual: number): Promise<BodegaStock>;
    registrarIngreso(stockId: number, cantidad: number): Promise<BodegaStock>;
    getTrazabilidad(repuestoId: number, sucursalId?: number): Promise<MovimientoTrazabilidadDto[]>;
    procesarConsumoEnTransaccion(manager: EntityManager, ordenTrabajoId: number, sucursalId: number, usuarioId: number, codigoOt: string, items: RepuestoConsumoItemDto[]): Promise<number>;
    private insertarMovimiento;
    private esMovimientoEntrada;
}
