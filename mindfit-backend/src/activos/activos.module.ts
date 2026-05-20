import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activo } from '../entities/activo.entity';
import { ActivosController } from './activos.controller';
import { ActivosService } from './activos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activo])],
  controllers: [ActivosController],
  providers: [ActivosService],
  exports: [ActivosService],
})
export class ActivosModule {}
