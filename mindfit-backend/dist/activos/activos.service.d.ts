import { DataSource } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
export declare class ActivosService {
    private readonly dataSource;
    private readonly transactionContext;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService);
    private repo;
    findAll(sucursalId?: number): Promise<Activo[]>;
    findOne(id: number): Promise<Activo>;
    findByUuid(uuidActivo: string): Promise<Activo>;
    create(dto: CreateActivoDto): Promise<Activo>;
    update(id: number, dto: UpdateActivoDto): Promise<Activo>;
}
