import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Activo } from '../entities/activo.entity';
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
    return this.repo()
      .createQueryBuilder('s')
      .where('s.deleted_at IS NULL')
      .orderBy('s.nombre', 'ASC')
      .getMany();
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
    await this.findOne(id);
    const activoRepo = this.transactionContext.getRepository(
      Activo,
      this.dataSource,
    );
    await activoRepo.softDelete({ sucursalId: id });
    await this.repo().update(id, { estaActiva: false });
    await this.repo().softDelete(id);
    return { deleted: true };
  }
}
