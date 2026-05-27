import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudPassword } from '../entities/solicitud-password.entity';
import { Usuario } from '../entities/usuario.entity';
import { PasswordResetModule } from '../auth/password-reset/password-reset.module';
import { SolicitudesPasswordService } from './solicitudes-password.service';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, SolicitudPassword]),
    PasswordResetModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService, SolicitudesPasswordService],
  exports: [UsuariosService, SolicitudesPasswordService],
})
export class UsuariosModule {}
