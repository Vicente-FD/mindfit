import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Observable, from, lastValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';
import { TransactionContextService } from '../database/transaction-context.service';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable({ scope: Scope.REQUEST })
export class AuditContextInterceptor implements NestInterceptor {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const method = request.method.toUpperCase();

    if (!WRITE_METHODS.has(method) || !request.user?.id) {
      return next.handle();
    }

    return from(
      this.dataSource.transaction(async (manager) => {
        try {
          await manager.query(
            `SELECT set_config('app.current_user_id', $1, true)`,
            [String(request.user!.id)],
          );
          this.transactionContext.setManager(manager);
          return await lastValueFrom(next.handle());
        } finally {
          this.transactionContext.clearManager();
        }
      }),
    );
  }
}
