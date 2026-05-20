import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Sucursal } from '../entities/sucursal.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
  ) {}

  private repo() {
    return this.transactionContext.getRepository(Sucursal, this.dataSource);
  }

  findAll() {
    return this.repo().find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const sucursal = await this.repo().findOne({ where: { id } });
    if (!sucursal) {
      throw new NotFoundException(`Sucursal ${id} no encontrada`);
    }
    return sucursal;
  }

  create(dto: CreateSucursalDto) {
    const sucursal = this.repo().create({
      nombre: dto.nombre,
      direccion: dto.direccion ?? null,
      comuna: dto.comuna ?? null,
      ciudad: dto.ciudad ?? null,
      estaActiva: dto.estaActiva ?? true,
    });
    return this.repo().save(sucursal);
  }

  async update(id: number, dto: UpdateSucursalDto) {
    const sucursal = await this.findOne(id);
    Object.assign(sucursal, dto);
    return this.repo().save(sucursal);
  }

  async remove(id: number) {
    const sucursal = await this.findOne(id);
    await this.repo().remove(sucursal);
    return { deleted: true };
  }
}
