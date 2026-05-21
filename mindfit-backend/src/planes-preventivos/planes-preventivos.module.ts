import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanPreventivo } from '../entities/plan-preventivo.entity';
import { OrdenesTrabajoModule } from '../ordenes-trabajo/ordenes-trabajo.module';
import { PlanesPreventivosController } from './planes-preventivos.controller';
import { PlanesPreventivosService } from './planes-preventivos.service';
import { CronSchedulerService } from './cron-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanPreventivo]),
    OrdenesTrabajoModule,
  ],
  controllers: [PlanesPreventivosController],
  providers: [PlanesPreventivosService, CronSchedulerService],
})
export class PlanesPreventivosModule {}
