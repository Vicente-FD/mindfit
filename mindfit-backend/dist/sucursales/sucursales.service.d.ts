import { DataSource } from 'typeorm';
import { Sucursal } from '../entities/sucursal.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
export declare class SucursalesService {
    private readonly dataSource;
    private readonly transactionContext;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService);
    private repo;
    findAll(): Promise<Sucursal[]>;
    findOne(id: number): Promise<Sucursal>;
    create(dto: CreateSucursalDto): Promise<Sucursal>;
    update(id: number, dto: UpdateSucursalDto): Promise<Sucursal>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
