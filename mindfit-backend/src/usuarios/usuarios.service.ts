import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
  ) {}

  private repo() {
    return this.transactionContext.getRepository(Usuario, this.dataSource);
  }

  findAll() {
    return this.repo().find({
      relations: { sucursal: true },
      order: { nombre: 'ASC' },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        sucursalId: true,
        telefono: true,
        estaActivo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const usuario = this.repo().create({
      email: dto.email.toLowerCase(),
      passwordHash,
      nombre: dto.nombre,
      rol: dto.rol,
      sucursalId: dto.sucursalId ?? null,
      telefono: dto.telefono ?? null,
      estaActivo: dto.estaActivo ?? true,
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
    }
    Object.assign(usuario, dto);
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
    const usuario = await this.repo().findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    usuario.estaActivo = false;
    await this.repo().save(usuario);
    return { deactivated: true };
  }
}
