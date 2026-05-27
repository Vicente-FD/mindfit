import { Module } from '@nestjs/common';
import { PasswordResetEventsService } from './password-reset-events.service';
import { PasswordResetGateway } from './password-reset.gateway';

@Module({
  providers: [PasswordResetEventsService, PasswordResetGateway],
  exports: [PasswordResetEventsService],
})
export class PasswordResetModule {}
