import { DataSource } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CodigoInventarioService } from './codigo-inventario.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { FilterActivosDto } from './dto/filter-activos.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
import { ActivoHistorialItemDto } from './dto/activo-historial.dto';
import { ActivoFichaDto } from './dto/activo-ficha.dto';
export declare class ActivosService {
    private readonly dataSource;
    private readonly transactionContext;
    private readonly codigoInventario;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService, codigoInventario: CodigoInventarioService);
    private repo;
    findAll(filters?: FilterActivosDto): Promise<Activo[]>;
    findOne(id: number): Promise<Activo>;
    private resolvePisoAsignado;
    findByUuid(uuidActivo: string): Promise<Activo>;
    findByPublicIdentifier(identifier: string): Promise<Activo>;
    getFichaPublica(identifier: string): Promise<ActivoFichaDto>;
    create(dto: CreateActivoDto): Promise<Activo>;
    update(id: number, dto: UpdateActivoDto): Promise<Activo>;
    getHistorial(activoId: number): Promise<ActivoHistorialItemDto[]>;
    private mapHistorialItem;
    private mapUsuario;
    private resolveComentarioCierre;
    private formatDuracion;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
