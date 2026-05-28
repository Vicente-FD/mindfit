import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt, randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { PasswordResetEventsService } from '../auth/password-reset/password-reset-events.service';
import {
  EstadoSolicitudPassword,
  OperacionAuditoria,
} from '../common/enums';
import { AuditTrail } from '../entities/audit-trail.entity';
import { SolicitudPassword } from '../entities/solicitud-password.entity';
import { Usuario } from '../entities/usuario.entity';

export interface SolicitudPasswordPendienteDto {
  id: number;
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string;
  createdAt: Date;
}

export interface AprobarSolicitudPasswordResultDto {
  solicitudId: number;
  usuarioId: number;
  contrasenaTemporal: string;
}

export interface SolicitarRecuperacionResponseDto {
  message: string;
  watchToken?: string;
}

@Injectable()
export class SolicitudesPasswordService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly passwordResetEvents: PasswordResetEventsService,
  ) {}

  async solicitar(email: string): Promise<SolicitarRecuperacionResponseDto> {
    const normalized = email.trim().toLowerCase();
    const usuario = await this.dataSource.getRepository(Usuario).findOne({
      where: { email: normalized, estaActivo: true },
    });

    let watchToken: string | undefined;

    if (usuario) {
      const repo = this.dataSource.getRepository(SolicitudPassword);
      let pendiente = await repo.findOne({
        where: {
          usuarioId: usuario.id,
          estado: EstadoSolicitudPassword.PENDIENTE,
        },
      });
      if (!pendiente) {
        pendiente = await repo.save(
          repo.create({
            usuarioId: usuario.id,
            estado: EstadoSolicitudPassword.PENDIENTE,
            watchToken: randomUUID(),
          }),
        );
      } else if (!pendiente.watchToken) {
        pendiente.watchToken = randomUUID();
        pendiente = await repo.save(pendiente);
      }
      watchToken = pendiente.watchToken ?? undefined;
      this.passwordResetEvents.emitAdminPendientesChanged();
    }

    return {
      message:
        'Si el correo está registrado, un administrador revisará su solicitud de restablecimiento.',
      watchToken,
    };
  }

  async findPendientes(): Promise<SolicitudPasswordPendienteDto[]> {
    const rows = await this.dataSource.getRepository(SolicitudPassword).find({
      where: { estado: EstadoSolicitudPassword.PENDIENTE },
      relations: { usuario: true },
      order: { createdAt: 'ASC' },
    });

    return rows.map((s) => ({
      id: s.id,
      usuarioId: s.usuarioId,
      nombre: s.usuario.nombre,
      email: s.usuario.email,
      rol: s.usuario.rol,
      createdAt: s.createdAt,
    }));
  }

  async aprobar(
    solicitudId: number,
    adminUserId: number,
  ): Promise<AprobarSolicitudPasswordResultDto> {
    return this.dataSource.transaction(async (manager) => {
      const solicitudRepo = manager.getRepository(SolicitudPassword);
      const usuarioRepo = manager.getRepository(Usuario);
      const auditRepo = manager.getRepository(AuditTrail);

      const solicitud = await solicitudRepo.findOne({
        where: { id: solicitudId },
        relations: { usuario: true },
      });

      if (!solicitud) {
        throw new NotFoundException(`Solicitud ${solicitudId} no encontrada`);
      }
      if (solicitud.estado !== EstadoSolicitudPassword.PENDIENTE) {
        throw new BadRequestException('La solicitud ya fue procesada');
      }

      const usuario = solicitud.usuario;
      if (!usuario?.estaActivo) {
        throw new BadRequestException('El usuario asociado no está activo');
      }

      const contrasenaTemporal = this.generateReadablePassword();
      const passwordHash = await bcrypt.hash(contrasenaTemporal, 12);
      const tokenVersionAnterior = usuario.tokenVersion ?? 0;

      usuario.passwordHash = passwordHash;
      usuario.requiereCambioPassword = true;
      usuario.tokenVersion = tokenVersionAnterior + 1;
      await usuarioRepo.save(usuario);

      solicitud.estado = EstadoSolicitudPassword.PROCESADO;
      solicitud.contrasenaTemporalLegible = contrasenaTemporal;
      await solicitudRepo.save(solicitud);

      await auditRepo.save({
        tableName: 'solicitudes_password',
        rowPk: String(solicitud.id),
        operation: OperacionAuditoria.UPDATE,
        userId: adminUserId,
        oldData: {
          estado: EstadoSolicitudPassword.PENDIENTE,
          usuarioId: usuario.id,
        },
        newData: {
          estado: EstadoSolicitudPassword.PROCESADO,
          usuarioId: usuario.id,
          requiereCambioPassword: true,
          tokenVersion: usuario.tokenVersion,
          aprobadoPorId: adminUserId,
        },
      });

      const result = {
        solicitudId: solicitud.id,
        usuarioId: usuario.id,
        contrasenaTemporal,
      };

      if (solicitud.watchToken) {
        this.passwordResetEvents.emitPasswordResetCompleted(
          solicitud.watchToken,
          {
            contrasenaTemporal,
            solicitudId: solicitud.id,
          },
        );
      }

      this.passwordResetEvents.emitAdminPendientesChanged();

      return result;
    });
  }

  async rechazar(
    solicitudId: number,
    adminUserId: number,
  ): Promise<{ solicitudId: number }> {
    return this.dataSource.transaction(async (manager) => {
      const solicitudRepo = manager.getRepository(SolicitudPassword);
      const auditRepo = manager.getRepository(AuditTrail);

      const solicitud = await solicitudRepo.findOne({
        where: { id: solicitudId },
        relations: { usuario: true },
      });

      if (!solicitud) {
        throw new NotFoundException(`Solicitud ${solicitudId} no encontrada`);
      }
      if (solicitud.estado !== EstadoSolicitudPassword.PENDIENTE) {
        throw new BadRequestException('La solicitud ya fue procesada');
      }

      solicitud.estado = EstadoSolicitudPassword.RECHAZADO;
      await solicitudRepo.save(solicitud);

      await auditRepo.save({
        tableName: 'solicitudes_password',
        rowPk: String(solicitud.id),
        operation: OperacionAuditoria.UPDATE,
        userId: adminUserId,
        oldData: {
          estado: EstadoSolicitudPassword.PENDIENTE,
          usuarioId: solicitud.usuarioId,
        },
        newData: {
          estado: EstadoSolicitudPassword.RECHAZADO,
          usuarioId: solicitud.usuarioId,
          rechazadoPorId: adminUserId,
        },
      });

      if (solicitud.watchToken) {
        this.passwordResetEvents.emitPasswordResetRejected(solicitud.watchToken, {
          solicitudId: solicitud.id,
          message:
            'El administrador rechazó su solicitud de restablecimiento de contraseña.',
        });
      }

      this.passwordResetEvents.emitAdminPendientesChanged();

      return { solicitudId: solicitud.id };
    });
  }

  private generateReadablePassword(): string {
    const words = ['Mindfit', 'Tempo', 'Acceso', 'Clave', 'Secure', 'Ops'];
    const tails = ['Flow', 'Pass', 'Key', 'Lock', 'Safe', 'Run'];
    const word = words[randomInt(words.length)];
    const tail = tails[randomInt(tails.length)];
    const num = randomInt(100, 999);
    const code = randomBytes(2).toString('hex').toUpperCase();
    return `${word}${tail}${code}${num}!`;
  }
}
