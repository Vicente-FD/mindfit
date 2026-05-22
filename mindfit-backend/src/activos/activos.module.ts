import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activo } from '../entities/activo.entity';
import { Categoria } from '../entities/categoria.entity';
import { Marca } from '../entities/marca.entity';
import { InventarioModule } from '../inventario/inventario.module';
import { ActivosController } from './activos.controller';
import { ActivosService } from './activos.service';
import { CodigoInventarioService } from './codigo-inventario.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activo, Marca, Categoria]),
    InventarioModule,
  ],
  controllers: [ActivosController],
  providers: [ActivosService, CodigoInventarioService],
  exports: [ActivosService],
})
export class ActivosModule {}
