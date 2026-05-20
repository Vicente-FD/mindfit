import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Usuario } from '../entities/usuario.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrdenTrabajo, Activo, Usuario])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
