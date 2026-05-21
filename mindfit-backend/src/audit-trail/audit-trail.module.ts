import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditTrail } from '../entities/audit-trail.entity';
import { AuditTrailController } from './audit-trail.controller';
import { AuditTrailService } from './audit-trail.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTrail])],
  controllers: [AuditTrailController],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}
