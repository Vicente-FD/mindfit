import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { EvidenciaOt } from '../entities/evidencia-ot.entity';
import { ComentarioOt } from '../entities/comentario-ot.entity';
import { OrdenesTrabajoController } from './ordenes-trabajo.controller';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrdenTrabajo, EvidenciaOt, ComentarioOt])],
  controllers: [OrdenesTrabajoController],
  providers: [OrdenesTrabajoService],
  exports: [OrdenesTrabajoService],
})
export class OrdenesTrabajoModule {}
