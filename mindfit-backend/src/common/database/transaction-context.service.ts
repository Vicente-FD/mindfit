import { Injectable, Scope } from '@nestjs/common';
import { DataSource, EntityManager, EntityTarget, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class TransactionContextService {
  private manager?: EntityManager;

  setManager(manager: EntityManager): void {
    this.manager = manager;
  }

  clearManager(): void {
    this.manager = undefined;
  }

  getManager(dataSource: DataSource): EntityManager {
    return this.manager ?? dataSource.manager;
  }

  getRepository<T extends object>(
    entity: EntityTarget<T>,
    dataSource: DataSource,
  ): Repository<T> {
    return this.getManager(dataSource).getRepository(entity);
  }
}
