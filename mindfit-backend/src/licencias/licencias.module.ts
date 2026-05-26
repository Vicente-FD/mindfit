import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicenciaTecnico } from '../entities/licencia-tecnico.entity';
import { Usuario } from '../entities/usuario.entity';
import { LicenciasController } from './licencias.controller';
import { LicenciasService } from './licencias.service';

@Module({
  imports: [TypeOrmModule.forFeature([LicenciaTecnico, Usuario])],
  controllers: [LicenciasController],
  providers: [LicenciasService],
  exports: [LicenciasService],
})
export class LicenciasModule {}
