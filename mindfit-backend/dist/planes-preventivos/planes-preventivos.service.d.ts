import { DataSource } from 'typeorm';
import { PlanPreventivo } from '../entities/plan-preventivo.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreatePlanPreventivoDto } from './dto/create-plan-preventivo.dto';
import { UpdatePlanPreventivoDto } from './dto/update-plan-preventivo.dto';
export declare class PlanesPreventivosService {
    private readonly dataSource;
    private readonly transactionContext;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService);
    private repo;
    findAll(): Promise<PlanPreventivo[]>;
    findOne(id: number): Promise<PlanPreventivo>;
    create(dto: CreatePlanPreventivoDto): Promise<PlanPreventivo>;
    update(id: number, dto: UpdatePlanPreventivoDto): Promise<PlanPreventivo>;
    remove(id: number): Promise<{
        deactivated: boolean;
    }>;
    private assertActivoVigente;
}
