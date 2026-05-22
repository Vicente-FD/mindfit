import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendicionGasto } from '../entities/rendicion-gasto.entity';
import { Usuario } from '../entities/usuario.entity';
import { RendicionesGastosController } from './rendiciones-gastos.controller';
import { RendicionesGastosService } from './rendiciones-gastos.service';

@Module({
  imports: [TypeOrmModule.forFeature([RendicionGasto, Usuario])],
  controllers: [RendicionesGastosController],
  providers: [RendicionesGastosService],
  exports: [RendicionesGastosService],
})
export class RendicionesGastosModule {}
