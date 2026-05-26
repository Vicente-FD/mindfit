import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { Cliente } from '../entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly dataSource: DataSource) {}

  private repo() {
    return this.dataSource.getRepository(Cliente);
  }

  findAll() {
    return this.repo().find({
      where: { deletedAt: IsNull() },
      order: { razonSocial: 'ASC' },
    });
  }

  async findOne(id: number) {
    const c = await this.repo().findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!c) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return c;
  }

  async create(dto: CreateClienteDto) {
    const rut = dto.rut.trim().toUpperCase();
    const email = dto.email.trim().toLowerCase();
    const dupRut = await this.repo().findOne({
      where: { rut },
      withDeleted: true,
    });
    const dupEmail = await this.repo().findOne({
      where: { email },
      withDeleted: true,
    });

    // Si el cliente existe pero está soft-deleted, lo "reactivamos" para evitar
    // el constraint UNIQUE de rut/email y preservar trazabilidad histórica.
    const reviveTarget =
      dupRut?.deletedAt ? dupRut : dupEmail?.deletedAt ? dupEmail : null;

    if (reviveTarget) {
      await this.repo().recover(reviveTarget);
      reviveTarget.rut = rut;
      reviveTarget.razonSocial = dto.razonSocial.trim();
      reviveTarget.email = email;
      reviveTarget.telefono = dto.telefono?.trim() ?? null;
      reviveTarget.direccion = dto.direccion.trim();
      reviveTarget.comuna = dto.comuna.trim();
      reviveTarget.ciudad = dto.ciudad.trim();
      return this.repo().save(reviveTarget);
    }

    if (dupRut?.deletedAt == null && dupRut) {
      throw new ConflictException(`RUT ${rut} ya registrado`);
    }
    if (dupEmail?.deletedAt == null && dupEmail) {
      throw new ConflictException('Email ya registrado');
    }

    const cliente = this.repo().create({
      rut,
      razonSocial: dto.razonSocial.trim(),
      email: dto.email.trim().toLowerCase(),
      telefono: dto.telefono?.trim() ?? null,
      direccion: dto.direccion.trim(),
      comuna: dto.comuna.trim(),
      ciudad: dto.ciudad.trim(),
    });
    return this.repo().save(cliente);
  }

  async update(id: number, dto: UpdateClienteDto) {
    const cliente = await this.findOne(id);
    if (dto.rut != null) {
      const rut = dto.rut.trim().toUpperCase();
      const dup = await this.repo().findOne({ where: { rut } });
      if (dup && dup.id !== id && !dup.deletedAt) {
        throw new ConflictException(`RUT ${rut} ya está en uso`);
      }
      cliente.rut = rut;
    }
    if (dto.razonSocial != null) cliente.razonSocial = dto.razonSocial.trim();
    if (dto.email != null) {
      const email = dto.email.trim().toLowerCase();
      const dup = await this.repo().findOne({ where: { email } });
      if (dup && dup.id !== id && !dup.deletedAt) {
        throw new ConflictException('Email ya está en uso');
      }
      cliente.email = email;
    }
    if (dto.telefono !== undefined) {
      cliente.telefono = dto.telefono?.trim() ?? null;
    }
    if (dto.direccion != null) cliente.direccion = dto.direccion.trim();
    if (dto.comuna != null) cliente.comuna = dto.comuna.trim();
    if (dto.ciudad != null) cliente.ciudad = dto.ciudad.trim();
    return this.repo().save(cliente);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo().softDelete(id);
    return { deleted: true };
  }
}
