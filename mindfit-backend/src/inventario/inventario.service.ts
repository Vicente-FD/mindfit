import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Repuesto } from '../entities/repuesto.entity';
import { BodegaStock } from '../entities/bodega-stock.entity';
import { OrdenTrabajoRepuesto } from '../entities/orden-trabajo-repuesto.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { FilterBodegaDto } from './dto/filter-bodega.dto';
import { RepuestoConsumoItemDto } from './dto/repuesto-consumo.dto';

export interface RepuestoDisponibleDto {
  repuestoId: number;
  stockId: number;
  sku: string;
  nombre: string;
  costoUnitario: number;
  cantidadActual: number;
  cantidadMinimaAlerta: number;
}

@Injectable()
export class InventarioService {
  constructor(private readonly dataSource: DataSource) {}

  findAllRepuestos() {
    return this.dataSource.getRepository(Repuesto).find({
      order: { nombre: 'ASC' },
    });
  }

  async findRepuesto(id: number) {
    const r = await this.dataSource.getRepository(Repuesto).findOne({
      where: { id },
    });
    if (!r) throw new NotFoundException(`Repuesto ${id} no encontrado`);
    return r;
  }

  async createRepuesto(dto: CreateRepuestoDto) {
    const exists = await this.dataSource.getRepository(Repuesto).findOne({
      where: { sku: dto.sku.trim() },
    });
    if (exists) {
      throw new ConflictException(`SKU ${dto.sku} ya existe`);
    }
    const repuesto = this.dataSource.getRepository(Repuesto).create({
      sku: dto.sku.trim(),
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() ?? null,
      costoUnitario: String(dto.costoUnitario),
    });
    const saved = await this.dataSource.getRepository(Repuesto).save(repuesto);
    await this.asegurarStock(saved.id);
    return saved;
  }

  async updateRepuesto(id: number, dto: UpdateRepuestoDto) {
    const repuesto = await this.findRepuesto(id);
    if (dto.sku != null) repuesto.sku = dto.sku.trim();
    if (dto.nombre != null) repuesto.nombre = dto.nombre.trim();
    if (dto.descripcion !== undefined) {
      repuesto.descripcion = dto.descripcion?.trim() ?? null;
    }
    if (dto.costoUnitario != null) {
      repuesto.costoUnitario = String(dto.costoUnitario);
    }
    return this.dataSource.getRepository(Repuesto).save(repuesto);
  }

  findStock(filters: FilterBodegaDto = {}) {
    const qb = this.dataSource
      .getRepository(BodegaStock)
      .createQueryBuilder('bs')
      .leftJoinAndSelect('bs.repuesto', 'repuesto')
      .orderBy('repuesto.nombre', 'ASC');

    if (filters.busqueda?.trim()) {
      const q = `%${filters.busqueda.trim().toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(repuesto.sku) LIKE :q OR LOWER(repuesto.nombre) LIKE :q)`,
        { q },
      );
    }

    return qb.getMany();
  }

  async getKpis() {
    const rows = await this.dataSource
      .getRepository(BodegaStock)
      .createQueryBuilder('bs')
      .leftJoin('bs.repuesto', 'repuesto')
      .select([
        'COUNT(DISTINCT repuesto.id)::int AS total_sku',
        'COALESCE(SUM(bs.cantidad_actual * repuesto.costo_unitario), 0)::numeric AS valorizacion',
        `SUM(CASE WHEN bs.cantidad_actual <= bs.cantidad_minima_alerta THEN 1 ELSE 0 END)::int AS alertas_reorden`,
      ])
      .getRawOne<{
        total_sku: number;
        valorizacion: string;
        alertas_reorden: number;
      }>();

    return {
      totalSku: rows?.total_sku ?? 0,
      valorizacionInventario: Number(rows?.valorizacion ?? 0),
      alertasReorden: rows?.alertas_reorden ?? 0,
    };
  }

  listRepuestosDisponibles(): Promise<RepuestoDisponibleDto[]> {
    return this.dataSource
      .getRepository(BodegaStock)
      .createQueryBuilder('bs')
      .innerJoinAndSelect('bs.repuesto', 'repuesto')
      .where('bs.cantidad_actual > 0')
      .orderBy('repuesto.nombre', 'ASC')
      .getMany()
      .then((rows) =>
        rows.map((bs) => ({
          repuestoId: bs.repuestoId,
          stockId: bs.id,
          sku: bs.repuesto.sku,
          nombre: bs.repuesto.nombre,
          costoUnitario: Number(bs.repuesto.costoUnitario),
          cantidadActual: bs.cantidadActual,
          cantidadMinimaAlerta: bs.cantidadMinimaAlerta,
        })),
      );
  }

  async asegurarStock(repuestoId: number) {
    await this.findRepuesto(repuestoId);

    let stock = await this.dataSource.getRepository(BodegaStock).findOne({
      where: { repuestoId },
    });
    if (!stock) {
      stock = this.dataSource.getRepository(BodegaStock).create({
        repuestoId,
        cantidadActual: 0,
        cantidadMinimaAlerta: 5,
      });
      stock = await this.dataSource.getRepository(BodegaStock).save(stock);
    }
    return stock;
  }

  async ajustarStock(stockId: number, cantidadActual: number) {
    const stock = await this.dataSource.getRepository(BodegaStock).findOne({
      where: { id: stockId },
      relations: { repuesto: true },
    });
    if (!stock) throw new NotFoundException('Registro de stock no encontrado');
    stock.cantidadActual = cantidadActual;
    return this.dataSource.getRepository(BodegaStock).save(stock);
  }

  async registrarIngreso(stockId: number, cantidad: number) {
    const stock = await this.dataSource.getRepository(BodegaStock).findOne({
      where: { id: stockId },
      relations: { repuesto: true },
    });
    if (!stock) throw new NotFoundException('Registro de stock no encontrado');
    stock.cantidadActual += cantidad;
    return this.dataSource.getRepository(BodegaStock).save(stock);
  }

  /**
   * Descuenta stock global y registra consumo dentro de una transacción externa.
   */
  async procesarConsumoEnTransaccion(
    manager: EntityManager,
    ordenTrabajoId: number,
    items: RepuestoConsumoItemDto[],
  ): Promise<number> {
    if (!items.length) return 0;

    let costoTotal = 0;

    for (const item of items) {
      const stock = await manager
        .getRepository(BodegaStock)
        .createQueryBuilder('bs')
        .setLock('pessimistic_write')
        .innerJoinAndSelect('bs.repuesto', 'repuesto')
        .where('bs.repuesto_id = :repuestoId', { repuestoId: item.repuestoId })
        .getOne();

      if (!stock) {
        throw new BadRequestException(
          `Repuesto #${item.repuestoId} no está registrado en la bodega central`,
        );
      }

      if (stock.cantidadActual < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente de «${stock.repuesto.nombre}» (SKU ${stock.repuesto.sku}). Disponible: ${stock.cantidadActual}, solicitado: ${item.cantidad}`,
        );
      }

      const costoUnitario = Number(stock.repuesto.costoUnitario);
      costoTotal += item.cantidad * costoUnitario;

      stock.cantidadActual -= item.cantidad;
      await manager.getRepository(BodegaStock).save(stock);

      const consumo = manager.getRepository(OrdenTrabajoRepuesto).create({
        ordenTrabajoId,
        repuestoId: item.repuestoId,
        cantidadUsada: item.cantidad,
        costoUnitarioAplicado: String(costoUnitario),
      });
      await manager.getRepository(OrdenTrabajoRepuesto).save(consumo);
    }

    return Math.round(costoTotal * 100) / 100;
  }
}
