import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repuesto } from '../entities/repuesto.entity';
import { BodegaStock } from '../entities/bodega-stock.entity';
import { OrdenTrabajoRepuesto } from '../entities/orden-trabajo-repuesto.entity';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repuesto, BodegaStock, OrdenTrabajoRepuesto]),
  ],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
