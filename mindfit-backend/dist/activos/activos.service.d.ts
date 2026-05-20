import { DataSource } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CodigoInventarioService } from './codigo-inventario.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { FilterActivosDto } from './dto/filter-activos.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
export declare class ActivosService {
    private readonly dataSource;
    private readonly transactionContext;
    private readonly codigoInventario;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService, codigoInventario: CodigoInventarioService);
    private repo;
    findAll(filters?: FilterActivosDto): Promise<Activo[]>;
    findOne(id: number): Promise<Activo>;
    findByUuid(uuidActivo: string): Promise<Activo>;
    findByPublicIdentifier(identifier: string): Promise<Activo>;
    create(dto: CreateActivoDto): Promise<Activo>;
    update(id: number, dto: UpdateActivoDto): Promise<Activo>;
}
