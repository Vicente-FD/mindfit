import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { EstadoOperacionalActivo } from '../common/enums';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

export interface SucursalListItem {
  id: number;
  nombre: string;
  sigla: string;
  direccion: string | null;
  comuna: string | null;
  ciudad: string | null;
  estaActiva: boolean;
  activosOperativos: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SucursalesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
  ) {}

  private repo() {
    return this.transactionContext.getRepository(Sucursal, this.dataSource);
  }

  async findAll(): Promise<SucursalListItem[]> {
    const rows = await this.repo()
      .createQueryBuilder('s')
      .where('s.deleted_at IS NULL')
      .orderBy('s.nombre', 'ASC')
      .getMany();

    const counts = await this.dataSource
      .getRepository(Activo)
      .createQueryBuilder('a')
      .select('a.sucursal_id', 'sucursalId')
      .addSelect('COUNT(*)::int', 'total')
      .where('a.deleted_at IS NULL')
      .andWhere('a.estado_operacional = :estado', {
        estado: EstadoOperacionalActivo.OPERATIVO,
      })
      .groupBy('a.sucursal_id')
      .getRawMany<{ sucursalId: string; total: number }>();

    const countMap = new Map(
      counts.map((c) => [Number(c.sucursalId), Number(c.total)]),
    );

    return rows.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      sigla: s.sigla,
      direccion: s.direccion,
      comuna: s.comuna,
      ciudad: s.ciudad,
      estaActiva: s.estaActiva,
      activosOperativos: countMap.get(s.id) ?? 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async findOne(id: number) {
    const sucursal = await this.repo()
      .createQueryBuilder('s')
      .where('s.id = :id', { id })
      .andWhere('s.deleted_at IS NULL')
      .getOne();
    if (!sucursal) {
      throw new NotFoundException(`Sucursal ${id} no encontrada`);
    }
    return sucursal;
  }

  private normalizeSigla(sigla: string): string {
    return sigla.trim().toUpperCase();
  }

  private async assertSiglaUnique(sigla: string, excludeId?: number) {
    const qb = this.repo()
      .createQueryBuilder('s')
      .where('s.sigla = :sigla', { sigla })
      .andWhere('s.deleted_at IS NULL');
    if (excludeId != null) {
      qb.andWhere('s.id != :excludeId', { excludeId });
    }
    const exists = await qb.getOne();
    if (exists) {
      throw new ConflictException(
        `La sigla «${sigla}» ya está asignada a otra sucursal activa`,
      );
    }
  }

  async create(dto: CreateSucursalDto) {
    const sigla = this.normalizeSigla(dto.sigla);
    await this.assertSiglaUnique(sigla);

    const sucursal = this.repo().create({
      nombre: dto.nombre.trim(),
      sigla,
      direccion: dto.direccion.trim(),
      comuna: dto.comuna.trim(),
      ciudad: dto.ciudad.trim(),
      estaActiva: dto.estaActiva ?? true,
    });

    try {
      return await this.repo().save(sucursal);
    } catch (err) {
      this.handleUniqueViolation(err);
      throw err;
    }
  }

  async update(id: number, dto: UpdateSucursalDto) {
    const sucursal = await this.findOne(id);

    if (dto.nombre != null) sucursal.nombre = dto.nombre.trim();
    if (dto.direccion != null) sucursal.direccion = dto.direccion.trim();
    if (dto.comuna != null) sucursal.comuna = dto.comuna.trim();
    if (dto.ciudad != null) sucursal.ciudad = dto.ciudad.trim();
    if (dto.estaActiva != null) sucursal.estaActiva = dto.estaActiva;
    if (dto.sigla != null) {
      const sigla = this.normalizeSigla(dto.sigla);
      await this.assertSiglaUnique(sigla, id);
      sucursal.sigla = sigla;
    }

    try {
      return await this.repo().save(sucursal);
    } catch (err) {
      this.handleUniqueViolation(err);
      throw err;
    }
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

  private handleUniqueViolation(err: unknown): void {
    const code = (err as { code?: string })?.code;
    if (code === '23505') {
      throw new ConflictException(
        'Nombre o sigla de sucursal ya existe en el sistema',
      );
    }
  }
}
