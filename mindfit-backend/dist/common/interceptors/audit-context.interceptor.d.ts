import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { TransactionContextService } from '../database/transaction-context.service';
export declare class AuditContextInterceptor implements NestInterceptor {
    private readonly dataSource;
    private readonly transactionContext;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
