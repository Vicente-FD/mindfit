import { Global, Module } from '@nestjs/common';
import { TransactionContextService } from './database/transaction-context.service';

@Global()
@Module({
  providers: [TransactionContextService],
  exports: [TransactionContextService],
})
export class CommonModule {}
