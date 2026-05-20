import { DataSource, EntityManager, EntityTarget, Repository } from 'typeorm';
export declare class TransactionContextService {
    private manager?;
    setManager(manager: EntityManager): void;
    clearManager(): void;
    getManager(dataSource: DataSource): EntityManager;
    getRepository<T extends object>(entity: EntityTarget<T>, dataSource: DataSource): Repository<T>;
}
