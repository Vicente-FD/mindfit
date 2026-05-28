import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { FacilidadesCriticasModule } from '../facilidades-criticas/facilidades-criticas.module';
import { SucursalesController } from './sucursales.controller';
import { SucursalesService } from './sucursales.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sucursal, Activo, OrdenTrabajo]),
    FacilidadesCriticasModule,
  ],
  controllers: [SucursalesController],
  providers: [SucursalesService],
  exports: [SucursalesService],
})
export class SucursalesModule {}
