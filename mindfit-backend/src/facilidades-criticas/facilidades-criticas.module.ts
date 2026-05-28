import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilidadCriticaHistorial } from '../entities/facilidad-critica-historial.entity';
import { FacilidadCritica } from '../entities/facilidad-critica.entity';
import { OrdenesTrabajoModule } from '../ordenes-trabajo/ordenes-trabajo.module';
import { FacilidadesCriticasController } from './facilidades-criticas.controller';
import { FacilidadesCriticasService } from './facilidades-criticas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacilidadCritica, FacilidadCriticaHistorial]),
    OrdenesTrabajoModule,
  ],
  controllers: [FacilidadesCriticasController],
  providers: [FacilidadesCriticasService],
  exports: [FacilidadesCriticasService],
})
export class FacilidadesCriticasModule {}
