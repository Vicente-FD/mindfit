import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { EstadoSesionUsuario, RolUsuario } from '../common/enums';
import { Usuario } from '../entities/usuario.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import {
  getDefaultPermisosForRol,
  resolvePermisosUi,
} from '../common/interfaces/permisos-ui.interface';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
  ) {}

  private async invalidateTokens(userId: number): Promise<void> {
    await this.repo().increment({ id: userId }, 'tokenVersion', 1);
  }

  private repo() {
    return this.transactionContext.getRepository(Usuario, this.dataSource);
  }

  findAll() {
    return this.repo()
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.sucursal', 'sucursal')
      .where('u.deleted_at IS NULL')
      .orderBy('u.nombre', 'ASC')
      .select([
        'u.id',
        'u.email',
        'u.nombre',
        'u.rol',
        'u.sucursalId',
        'u.telefono',
        'u.estaActivo',
        'u.permisosUi',
        'u.estadoSesion',
        'u.createdAt',
        'u.updatedAt',
        'sucursal',
      ])
      .getMany();
  }

  async findOne(id: number) {
    const usuario = await this.repo().findOne({
      where: { id },
      relations: { sucursal: true },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        sucursalId: true,
        telefono: true,
        estaActivo: true,
        permisosUi: true,
        estadoSesion: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const exists = await this.repo().findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) {
      throw new ConflictException('El email ya está registrado');
    }

    if (dto.rol === RolUsuario.JEFE_SUCURSAL && !dto.sucursalId) {
      throw new BadRequestException(
        'Jefe de sucursal requiere una sede asignada',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const usuario = this.repo().create({
      email: dto.email.toLowerCase(),
      passwordHash,
      nombre: dto.nombre,
      rol: dto.rol,
      sucursalId: dto.sucursalId ?? null,
      telefono: dto.telefono ?? null,
      estaActivo: dto.estaActivo ?? true,
      permisosUi: dto.permisosUi ?? getDefaultPermisosForRol(dto.rol),
    });
    const saved = await this.repo().save(usuario);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const usuario = await this.repo().findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }

    if (dto.email) {
      dto.email = dto.email.toLowerCase();
      if (dto.email !== usuario.email) {
        const exists = await this.repo().findOne({
          where: { email: dto.email },
        });
        if (exists) {
          throw new ConflictException('El email ya está registrado');
        }
      }
    }

    const rol = dto.rol ?? usuario.rol;
    const sucursalId =
      dto.sucursalId !== undefined ? dto.sucursalId : usuario.sucursalId;

    if (rol === RolUsuario.JEFE_SUCURSAL && !sucursalId) {
      throw new BadRequestException(
        'Jefe de sucursal requiere una sede asignada',
      );
    }

    if (dto.rol !== undefined || dto.sucursalId !== undefined) {
      usuario.sucursalId = sucursalId ?? null;
    }

    const rolFinal = dto.rol ?? usuario.rol;
    const permisosCambiaron =
      dto.permisosUi !== undefined &&
      JSON.stringify(resolvePermisosUi(usuario.rol, usuario.permisosUi)) !==
        JSON.stringify(resolvePermisosUi(rolFinal, dto.permisosUi));
    const rolCambio = dto.rol !== undefined && dto.rol !== usuario.rol;

    const { sucursalId: _omit, ...rest } = dto;
    Object.assign(usuario, rest);

    if (dto.estaActivo === false) {
      await this.invalidateTokens(id);
      usuario.estadoSesion = EstadoSesionUsuario.DESCONECTADO;
    } else if (permisosCambiaron || rolCambio) {
      await this.invalidateTokens(id);
    }

    await this.repo().save(usuario);
    return this.findOne(id);
  }

  async updatePassword(id: number, dto: UpdatePasswordDto) {
    const usuario = await this.repo().findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    usuario.passwordHash = await bcrypt.hash(dto.password, 12);
    await this.repo().save(usuario);
    return { updated: true };
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    usuario.estaActivo = false;
    await this.invalidateTokens(id);
    await this.repo().save(usuario);
    await this.repo().softDelete(id);
    return { deleted: true };
  }
}
