import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursal } from '../entities/sucursal.entity';
import { SucursalesController } from './sucursales.controller';
import { SucursalesService } from './sucursales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal])],
  controllers: [SucursalesController],
  providers: [SucursalesService],
  exports: [SucursalesService],
})
export class SucursalesModule {}
