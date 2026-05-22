import { DataSource } from 'typeorm';
import { Sucursal } from '../entities/sucursal.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { SucursalMonitoreoResponseDto } from './dto/sucursal-monitoreo.dto';
export interface SucursalListItem {
    id: number;
    nombre: string;
    sigla: string;
    direccion: string | null;
    comuna: string | null;
    ciudad: string | null;
    estaActiva: boolean;
    cantidadPisos: number;
    activosOperativos: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SucursalesService {
    private readonly dataSource;
    private readonly transactionContext;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService);
    private repo;
    findAll(): Promise<SucursalListItem[]>;
    findOne(id: number): Promise<Sucursal>;
    getMonitoreo(sucursalId: number): Promise<SucursalMonitoreoResponseDto>;
    getMonitoreoGlobal(): Promise<SucursalMonitoreoResponseDto>;
    private buildMonitoreoPayload;
    private sedeRefOrden;
    private resolutionDate;
    private comentarioCierre;
    private evidenciasAntesDespues;
    private elapsedFrom;
    private normalizeSigla;
    private assertSiglaUnique;
    create(dto: CreateSucursalDto): Promise<Sucursal>;
    update(id: number, dto: UpdateSucursalDto): Promise<Sucursal>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    private handleUniqueViolation;
}
