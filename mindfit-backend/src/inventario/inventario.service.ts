import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { TipoMovimientoInventario } from '../common/enums';
import { MovimientoInventario } from '../entities/movimiento-inventario.entity';
import { Repuesto } from '../entities/repuesto.entity';
import { BodegaStock } from '../entities/bodega-stock.entity';
import { OrdenTrabajoRepuesto } from '../entities/orden-trabajo-repuesto.entity';
import { Activo } from '../entities/activo.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { FilterBodegaDto } from './dto/filter-bodega.dto';
import { RepuestoConsumoItemDto } from './dto/repuesto-consumo.dto';
import { BodegaAjusteDto } from './dto/bodega-ajuste.dto';

export interface BodegaMaquinaDto {
  id: number;
  codigoInventario: string;
  nombre: string;
  marca: string;
  modelo: string | null;
  categoria: string;
  estadoOperacional: string;
  aptoParaVenta: boolean;
  precioVentaClp: number;
}

export interface RepuestoDisponibleDto {
  repuestoId: number;
  stockId: number;
  sku: string;
  nombre: string;
  costoUnitario: number;
  cantidadActual: number;
  cantidadMinimaAlerta: number;
}

export interface MovimientoTrazabilidadDto {
  id: number;
  tipoMovimiento: TipoMovimientoInventario;
  cantidad: number;
  costoUnitarioMomento: number;
  motivo: string;
  createdAt: Date;
  sucursalId: number;
  sucursalNombre: string;
  sucursalSigla: string;
  usuarioNombre: string;
  ordenTrabajoId: number | null;
  codigoOt: string | null;
  ordenTitulo: string | null;
  activoNombre: string | null;
  esEntrada: boolean;
}

@Injectable()
export class InventarioService {
  constructor(private readonly dataSource: DataSource) {}

  findAllRepuestos() {
    return this.dataSource.getRepository(Repuesto).find({
      where: { deletedAt: IsNull() },
      order: { nombre: 'ASC' },
    });
  }

  async findRepuesto(id: number) {
    const r = await this.dataSource.getRepository(Repuesto).findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!r) throw new NotFoundException(`Repuesto ${id} no encontrado`);
    return r;
  }

  async createRepuesto(dto: CreateRepuestoDto) {
    const exists = await this.dataSource.getRepository(Repuesto).findOne({
      where: { sku: dto.sku.trim() },
    });
    if (exists && !exists.deletedAt) {
      throw new ConflictException(`SKU ${dto.sku} ya existe`);
    }
    const repuesto = this.dataSource.getRepository(Repuesto).create({
      sku: dto.sku.trim(),
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() ?? null,
      costoUnitario: String(dto.costoUnitario),
      aptoParaVenta: dto.aptoParaVenta ?? false,
      precioVentaClp: String(dto.precioVentaClp ?? 0),
    });
    const saved = await this.dataSource.getRepository(Repuesto).save(repuesto);
    await this.asegurarStock(saved.id);
    return saved;
  }

  async updateRepuesto(id: number, dto: UpdateRepuestoDto) {
    const repuesto = await this.findRepuesto(id);
    if (dto.sku != null) {
      const sku = dto.sku.trim();
      const dup = await this.dataSource.getRepository(Repuesto).findOne({
        where: { sku },
      });
      if (dup && dup.id !== id && !dup.deletedAt) {
        throw new ConflictException(`SKU ${sku} ya está en uso`);
      }
      repuesto.sku = sku;
    }
    if (dto.nombre != null) repuesto.nombre = dto.nombre.trim();
    if (dto.descripcion !== undefined) {
      repuesto.descripcion = dto.descripcion?.trim() ?? null;
    }
    if (dto.costoUnitario != null) {
      repuesto.costoUnitario = String(dto.costoUnitario);
    }
    if (dto.aptoParaVenta != null) {
      repuesto.aptoParaVenta = dto.aptoParaVenta;
    }
    if (dto.precioVentaClp != null) {
      repuesto.precioVentaClp = String(dto.precioVentaClp);
    }
    return this.dataSource.getRepository(Repuesto).save(repuesto);
  }

  async softDeleteRepuesto(id: number) {
    await this.findRepuesto(id);
    await this.dataSource.getRepository(Repuesto).softDelete(id);
    return { deleted: true };
  }

  findStock(filters: FilterBodegaDto = {}) {
    const qb = this.dataSource
      .getRepository(BodegaStock)
      .createQueryBuilder('bs')
      .innerJoinAndSelect('bs.repuesto', 'repuesto')
      .where('repuesto.deleted_at IS NULL')
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
      .innerJoin('bs.repuesto', 'repuesto')
      .where('repuesto.deleted_at IS NULL')
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

  async updateMaquinaVentaComercial(
    activoId: number,
    aptoParaVenta: boolean,
    precioVentaClp?: number,
  ): Promise<BodegaMaquinaDto> {
    const repo = this.dataSource.getRepository(Activo);
    const activo = await repo.findOne({
      where: { id: activoId, deletedAt: IsNull() },
      relations: { categoriaRelacion: true },
    });

    if (!activo) {
      throw new NotFoundException(`Máquina ${activoId} no encontrada`);
    }
    if (activo.sucursalId != null) {
      throw new BadRequestException(
        'Solo se puede habilitar venta de máquinas en Bodega Central',
      );
    }
    if (activo.estadoOperacional === 'reservado_venta') {
      throw new BadRequestException(
        'No se puede modificar: máquina reservada en cotización pendiente',
      );
    }
    if (activo.estadoOperacional === 'vendido') {
      throw new BadRequestException('No se puede modificar: máquina vendida');
    }

    const patch: Partial<Activo> = { aptoParaVenta };
    if (precioVentaClp != null) {
      patch.precioVentaClp = String(precioVentaClp);
    }
    await repo.update(activoId, patch);
    const saved = await repo.findOne({
      where: { id: activoId },
      relations: { categoriaRelacion: true },
    });
    if (!saved) {
      throw new NotFoundException(`Máquina ${activoId} no encontrada`);
    }

    return {
      id: saved.id,
      codigoInventario: saved.codigoInventario ?? `ACT-${saved.id}`,
      nombre: saved.nombre,
      marca: saved.marca ?? '—',
      modelo: saved.modelo,
      categoria:
        saved.categoriaRelacion?.nombre ?? saved.categoria ?? 'Equipo',
      estadoOperacional: saved.estadoOperacional,
      aptoParaVenta: saved.aptoParaVenta,
      precioVentaClp: Number(saved.precioVentaClp ?? 0),
    };
  }

  async listMaquinasBodega(busqueda?: string): Promise<BodegaMaquinaDto[]> {
    const q = busqueda?.trim().toLowerCase();
    const qb = this.dataSource
      .getRepository(Activo)
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.categoriaRelacion', 'cat')
      .where('a.deleted_at IS NULL')
      .andWhere('a.sucursal_id IS NULL');

    if (q) {
      qb.andWhere(
        `(LOWER(a.nombre) LIKE :q OR LOWER(a.codigo_inventario) LIKE :q OR LOWER(a.marca) LIKE :q)`,
        { q: `%${q}%` },
      );
    }

    const rows = await qb.orderBy('a.nombre', 'ASC').take(200).getMany();

    return rows.map((a) => ({
      id: a.id,
      codigoInventario: a.codigoInventario ?? `ACT-${a.id}`,
      nombre: a.nombre,
      marca: a.marca ?? '—',
      modelo: a.modelo,
      categoria: a.categoriaRelacion?.nombre ?? a.categoria ?? 'Equipo',
      estadoOperacional: a.estadoOperacional,
      aptoParaVenta: a.aptoParaVenta,
      precioVentaClp: Number(a.precioVentaClp ?? 0),
    }));
  }

  listRepuestosDisponibles(): Promise<RepuestoDisponibleDto[]> {
    return this.dataSource
      .getRepository(BodegaStock)
      .createQueryBuilder('bs')
      .innerJoinAndSelect('bs.repuesto', 'repuesto')
      .where('bs.cantidad_actual > 0')
      .andWhere('repuesto.deleted_at IS NULL')
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

  async registrarAjuste(dto: BodegaAjusteDto, usuarioId: number) {
    const tiposEntrada = [
      TipoMovimientoInventario.INGRESO_COMPRA,
      TipoMovimientoInventario.AJUSTE_MANUAL_POSITIVO,
    ];
    const tiposSalida = [
      TipoMovimientoInventario.AJUSTE_MANUAL_NEGATIVO,
    ];

    if (
      !tiposEntrada.includes(dto.tipoMovimiento) &&
      !tiposSalida.includes(dto.tipoMovimiento)
    ) {
      throw new BadRequestException(
        'tipo_movimiento no válido para ajuste manual de bodega',
      );
    }

    const sucursal = await this.dataSource.getRepository(Sucursal).findOne({
      where: { id: dto.sucursalId, deletedAt: IsNull() },
    });
    if (!sucursal) {
      throw new NotFoundException(`Sucursal ${dto.sucursalId} no encontrada`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const stock = await manager
        .getRepository(BodegaStock)
        .createQueryBuilder('bs')
        .setLock('pessimistic_write')
        .innerJoinAndSelect('bs.repuesto', 'repuesto')
        .where('bs.repuesto_id = :repuestoId', { repuestoId: dto.repuestoId })
        .andWhere('repuesto.deleted_at IS NULL')
        .getOne();

      if (!stock) {
        throw new NotFoundException(
          'Repuesto sin fila de stock en bodega central',
        );
      }

      const costoUnitario = Number(stock.repuesto.costoUnitario);
      const motivo = dto.motivo.trim();

      if (tiposEntrada.includes(dto.tipoMovimiento)) {
        stock.cantidadActual += dto.cantidad;
      } else {
        if (stock.cantidadActual < dto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente. Disponible: ${stock.cantidadActual}, solicitado: ${dto.cantidad}`,
          );
        }
        stock.cantidadActual -= dto.cantidad;
      }

      await manager.getRepository(BodegaStock).save(stock);

      await this.insertarMovimiento(manager, {
        sucursalId: dto.sucursalId,
        repuestoId: dto.repuestoId,
        usuarioId,
        tipoMovimiento: dto.tipoMovimiento,
        cantidad: dto.cantidad,
        costoUnitarioMomento: costoUnitario,
        ordenTrabajoId: null,
        motivo,
      });

      await queryRunner.commitTransaction();
      return this.asegurarStock(dto.repuestoId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /** @deprecated Use registrarAjuste */
  async ajustarStock(stockId: number, cantidadActual: number) {
    const stock = await this.dataSource.getRepository(BodegaStock).findOne({
      where: { id: stockId },
      relations: { repuesto: true },
    });
    if (!stock) throw new NotFoundException('Registro de stock no encontrado');
    stock.cantidadActual = cantidadActual;
    return this.dataSource.getRepository(BodegaStock).save(stock);
  }

  /** @deprecated Use registrarAjuste */
  async registrarIngreso(stockId: number, cantidad: number) {
    const stock = await this.dataSource.getRepository(BodegaStock).findOne({
      where: { id: stockId },
      relations: { repuesto: true },
    });
    if (!stock) throw new NotFoundException('Registro de stock no encontrado');
    stock.cantidadActual += cantidad;
    return this.dataSource.getRepository(BodegaStock).save(stock);
  }

  async getTrazabilidad(
    repuestoId: number,
    sucursalId?: number,
  ): Promise<MovimientoTrazabilidadDto[]> {
    await this.findRepuesto(repuestoId);

    const qb = this.dataSource
      .getRepository(MovimientoInventario)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sucursal', 'sucursal')
      .leftJoinAndSelect('m.usuario', 'usuario')
      .leftJoinAndSelect('m.ordenTrabajo', 'ot')
      .leftJoinAndSelect('ot.activo', 'activo')
      .where('m.repuesto_id = :repuestoId', { repuestoId })
      .orderBy('m.created_at', 'DESC');

    if (sucursalId != null) {
      qb.andWhere('m.sucursal_id = :sucursalId', { sucursalId });
    }

    const rows = await qb.getMany();

    return rows.map((m) => ({
      id: m.id,
      tipoMovimiento: m.tipoMovimiento,
      cantidad: m.cantidad,
      costoUnitarioMomento: Number(m.costoUnitarioMomento),
      motivo: m.motivo,
      createdAt: m.createdAt,
      sucursalId: m.sucursalId,
      sucursalNombre: m.sucursal?.nombre ?? `Sede #${m.sucursalId}`,
      sucursalSigla: m.sucursal?.sigla ?? '—',
      usuarioNombre: m.usuario?.nombre ?? 'Usuario',
      ordenTrabajoId: m.ordenTrabajoId,
      codigoOt: m.ordenTrabajo?.codigoOt ?? null,
      ordenTitulo: m.ordenTrabajo?.titulo ?? null,
      activoNombre: m.ordenTrabajo?.activo?.nombre ?? null,
      esEntrada: this.esMovimientoEntrada(m.tipoMovimiento),
    }));
  }

  /**
   * Descuenta stock global, registra consumo OT y filas Kardex.
   */
  async procesarConsumoEnTransaccion(
    manager: EntityManager,
    ordenTrabajoId: number,
    sucursalId: number,
    usuarioId: number,
    codigoOt: string,
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
        .andWhere('repuesto.deleted_at IS NULL')
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

      await this.insertarMovimiento(manager, {
        sucursalId,
        repuestoId: item.repuestoId,
        usuarioId,
        tipoMovimiento: TipoMovimientoInventario.CONSUMO_OT,
        cantidad: item.cantidad,
        costoUnitarioMomento: costoUnitario,
        ordenTrabajoId,
        motivo: `Consumo por reparación ${codigoOt}`,
      });
    }

    return Math.round(costoTotal * 100) / 100;
  }

  private async insertarMovimiento(
    manager: EntityManager,
    data: {
      sucursalId: number;
      repuestoId: number;
      usuarioId: number;
      tipoMovimiento: TipoMovimientoInventario;
      cantidad: number;
      costoUnitarioMomento: number;
      ordenTrabajoId: number | null;
      motivo: string;
    },
  ): Promise<void> {
    const mov = manager.getRepository(MovimientoInventario).create({
      sucursalId: data.sucursalId,
      repuestoId: data.repuestoId,
      usuarioId: data.usuarioId,
      tipoMovimiento: data.tipoMovimiento,
      cantidad: data.cantidad,
      costoUnitarioMomento: String(data.costoUnitarioMomento),
      ordenTrabajoId: data.ordenTrabajoId,
      motivo: data.motivo,
    });
    await manager.getRepository(MovimientoInventario).save(mov);
  }

  private esMovimientoEntrada(tipo: TipoMovimientoInventario): boolean {
    return (
      tipo === TipoMovimientoInventario.INGRESO_COMPRA ||
      tipo === TipoMovimientoInventario.AJUSTE_MANUAL_POSITIVO
    );
  }
}
