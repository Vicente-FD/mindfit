import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlanPreventivo } from '../entities/plan-preventivo.entity';
import { Activo } from '../entities/activo.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreatePlanPreventivoDto } from './dto/create-plan-preventivo.dto';
import { UpdatePlanPreventivoDto } from './dto/update-plan-preventivo.dto';

@Injectable()
export class PlanesPreventivosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
  ) {}

  private repo() {
    return this.transactionContext.getRepository(PlanPreventivo, this.dataSource);
  }

  findAll() {
    return this.repo()
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.equipo', 'equipo')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal')
      .orderBy('p.proximaFechaEjecucion', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const plan = await this.repo().findOne({
      where: { id },
      relations: { equipo: { sucursal: true } },
    });
    if (!plan) {
      throw new NotFoundException(`Plan preventivo ${id} no encontrado`);
    }
    return plan;
  }

  async create(dto: CreatePlanPreventivoDto) {
    await this.assertActivoVigente(dto.activoId);
    const plan = this.repo().create({
      titulo: dto.titulo,
      descripcion: dto.descripcion ?? null,
      activoId: dto.activoId,
      intervaloDias: dto.intervaloDias,
      proximaFechaEjecucion: dto.proximaFechaEjecucion,
      planActivo: dto.activo ?? true,
    });
    return this.repo().save(plan);
  }

  async update(id: number, dto: UpdatePlanPreventivoDto) {
    const plan = await this.findOne(id);
    if (dto.activoId != null) {
      await this.assertActivoVigente(dto.activoId);
      plan.activoId = dto.activoId;
    }
    if (dto.titulo != null) plan.titulo = dto.titulo;
    if (dto.descripcion !== undefined) plan.descripcion = dto.descripcion || null;
    if (dto.intervaloDias != null) plan.intervaloDias = dto.intervaloDias;
    if (dto.proximaFechaEjecucion != null) {
      plan.proximaFechaEjecucion = dto.proximaFechaEjecucion;
    }
    if (dto.activo != null) plan.planActivo = dto.activo;
    return this.repo().save(plan);
  }

  async remove(id: number) {
    const plan = await this.findOne(id);
    plan.planActivo = false;
    await this.repo().save(plan);
    return { deactivated: true };
  }

  private async assertActivoVigente(activoId: number) {
    const count = await this.dataSource
      .getRepository(Activo)
      .createQueryBuilder('a')
      .where('a.id = :id', { id: activoId })
      .andWhere('a.deleted_at IS NULL')
      .getCount();
    if (!count) {
      throw new BadRequestException('Activo no encontrado o dado de baja');
    }
  }
}
