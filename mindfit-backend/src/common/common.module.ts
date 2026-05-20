import { Global, Module, Scope } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { TransactionContextService } from './database/transaction-context.service';
import { AuditContextInterceptor } from './interceptors/audit-context.interceptor';

@Global()
@Module({
  providers: [
    TransactionContextService,
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useFactory: (
        dataSource: DataSource,
        transactionContext: TransactionContextService,
      ) => new AuditContextInterceptor(dataSource, transactionContext),
      inject: [DataSource, TransactionContextService],
    },
  ],
  exports: [TransactionContextService],
})
export class CommonModule {}
