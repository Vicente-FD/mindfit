import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import {
  DivisaCodigo,
  EstadoCotizacionVenta,
  EstadoOperacionalActivo,
  EtapaOportunidad,
} from '../common/enums';
import { Activo } from '../entities/activo.entity';
import { Categoria } from '../entities/categoria.entity';
import { CotizacionVenta } from '../entities/cotizacion-venta.entity';
import { CotizacionVentasDetalle } from '../entities/cotizacion-ventas-detalle.entity';
import { Oportunidad } from '../entities/oportunidad.entity';
import { ClientesService } from '../clientes/clientes.service';
import { DivisasService } from '../divisas/divisas.service';
import { CreateCotizacionVentaDto } from './dto/create-cotizacion-venta.dto';
import { CotizacionDetalleItemDto } from './dto/cotizacion-detalle-item.dto';
import { UpdateEstadoCotizacionDto } from './dto/update-estado-cotizacion.dto';

@Injectable()
export class CotizacionesVentasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clientesService: ClientesService,
    private readonly divisasService: DivisasService,
  ) {}

  private repo() {
    return this.dataSource.getRepository(CotizacionVenta);
  }

  findAll() {
    return this.repo().find({
      relations: {
        cliente: true,
        creadoPor: true,
        oportunidad: true,
        detalles: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const c = await this.repo().findOne({
      where: { id },
      relations: {
        cliente: true,
        creadoPor: true,
        oportunidad: { cliente: true },
        detalles: { activo: true },
      },
    });
    if (!c) {
      throw new NotFoundException(`Cotización ${id} no encontrada`);
    }
    return c;
  }

  async create(dto: CreateCotizacionVentaDto, creadoPorId: number) {
    if (!dto.detalles?.length) {
      throw new BadRequestException('Debe incluir al menos una máquina');
    }

    for (const item of dto.detalles) {
      if (item.repuestoId != null) {
        throw new BadRequestException(
          'Las cotizaciones comerciales solo admiten máquinas de Bodega Central',
        );
      }
      if (item.activoId == null) {
        throw new BadRequestException('Cada línea debe referenciar un activo');
      }
    }

    await this.clientesService.findOne(dto.clienteId);

    const tasas = await this.divisasService.getTasas();
    const tasaCambio =
      dto.tasaCambioClp ??
      this.divisasService.tasaParaDivisa(tasas, dto.divisaCodigo);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const folio = await this.generarFolio(manager);
      const lineas = await this.procesarDetallesActivos(
        manager,
        dto.detalles,
      );

      const subtotal =
        dto.subtotalNeto ??
        lineas.reduce((s, l) => s + Number(l.totalLineaNeto), 0);
      const montoIva =
        dto.montoIva ??
        (dto.divisaCodigo === DivisaCodigo.CLP
          ? Math.round(subtotal * 0.19 * 100) / 100
          : 0);
      const montoBruto = dto.montoBruto ?? subtotal + montoIva;

      const cotizacion = manager.getRepository(CotizacionVenta).create({
        folio,
        clienteId: dto.clienteId,
        creadoPorId,
        oportunidadId: dto.oportunidadId ?? null,
        divisaCodigo: dto.divisaCodigo,
        tasaCambioClp: String(tasaCambio),
        subtotalNeto: String(Math.round(subtotal * 100) / 100),
        montoIva: String(Math.round(montoIva * 100) / 100),
        montoBruto: String(Math.round(montoBruto * 100) / 100),
        comentariosComerciales: dto.comentariosComerciales?.trim() ?? null,
        estado: EstadoCotizacionVenta.PENDIENTE_APROBACION,
        detalles: lineas,
      });

      const saved = await manager.getRepository(CotizacionVenta).save(cotizacion);
      await queryRunner.commitTransaction();
      return this.findOne(saved.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async actualizarEstado(id: number, dto: UpdateEstadoCotizacionDto) {
    const cotizacion = await this.findOne(id);

    if (cotizacion.estado !== EstadoCotizacionVenta.PENDIENTE_APROBACION) {
      throw new BadRequestException(
        'Solo se pueden aprobar o rechazar cotizaciones pendientes de aprobación',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const activoRepo = manager.getRepository(Activo);

      if (dto.estado === EstadoCotizacionVenta.APROBADA) {
        for (const linea of cotizacion.detalles) {
          if (!linea.activoId) continue;
          const activo = await activoRepo.findOne({
            where: { id: linea.activoId, deletedAt: IsNull() },
          });
          if (!activo) continue;
          activo.estadoOperacional = EstadoOperacionalActivo.VENDIDO;
          activo.aptoParaVenta = false;
          await activoRepo.save(activo);
          await activoRepo.softDelete(activo.id);
        }

        if (cotizacion.oportunidadId != null) {
          await manager.getRepository(Oportunidad).update(
            cotizacion.oportunidadId,
            { etapa: EtapaOportunidad.GANADA },
          );
        }
      } else {
        for (const linea of cotizacion.detalles) {
          if (!linea.activoId) continue;
          const activo = await activoRepo.findOne({
            where: { id: linea.activoId, deletedAt: IsNull() },
          });
          if (!activo) continue;
          if (activo.sucursalId != null) {
            throw new BadRequestException(
              `El activo ${activo.id} ya no está en Bodega Central`,
            );
          }
          activo.estadoOperacional = EstadoOperacionalActivo.OPERATIVO;
          await activoRepo.save(activo);
        }
      }

      await manager.getRepository(CotizacionVenta).update(id, {
        estado: dto.estado,
      });

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async generarFolio(manager: EntityManager): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `COT-${year}-`;
    const last = await manager
      .getRepository(CotizacionVenta)
      .createQueryBuilder('c')
      .where('c.folio LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('c.id', 'DESC')
      .getOne();

    let seq = 1;
    if (last?.folio) {
      const n = parseInt(last.folio.replace(prefix, ''), 10);
      if (Number.isFinite(n)) seq = n + 1;
    }
    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  private async procesarDetallesActivos(
    manager: EntityManager,
    items: CotizacionDetalleItemDto[],
  ): Promise<CotizacionVentasDetalle[]> {
    const lineas: CotizacionVentasDetalle[] = [];
    const vistos = new Set<number>();

    for (const item of items) {
      const activoId = item.activoId!;
      if (vistos.has(activoId)) {
        throw new BadRequestException(
          `La máquina ${activoId} está duplicada en la cotización`,
        );
      }
      vistos.add(activoId);
      lineas.push(await this.procesarLineaActivo(manager, item, activoId));
    }

    return lineas;
  }

  private async procesarLineaActivo(
    manager: EntityManager,
    item: CotizacionDetalleItemDto,
    activoId: number,
  ): Promise<CotizacionVentasDetalle> {
    const activo = await manager.getRepository(Activo).findOne({
      where: { id: activoId, deletedAt: IsNull() },
      lock: { mode: 'pessimistic_write' },
    });

    if (!activo) {
      throw new BadRequestException(`Máquina ${activoId} no disponible`);
    }

    let categoriaNombre = activo.categoria ?? 'Equipo';
    if (activo.categoriaId != null) {
      const cat = await manager.getRepository(Categoria).findOne({
        where: { id: activo.categoriaId },
      });
      if (cat?.nombre) {
        categoriaNombre = cat.nombre;
      }
    }
    if (activo.sucursalId != null) {
      throw new BadRequestException(
        `«${activo.nombre}» no está en Bodega Central`,
      );
    }
    if (!activo.aptoParaVenta) {
      throw new BadRequestException(
        `«${activo.nombre}» no está habilitada para venta`,
      );
    }
    if (activo.estadoOperacional === EstadoOperacionalActivo.RESERVADO_VENTA) {
      throw new BadRequestException(
        `«${activo.nombre}» ya está reservada en otra cotización`,
      );
    }
    if (item.cantidad !== 1) {
      throw new BadRequestException(
        'Cada máquina se cotiza en cantidad 1 (unidad física única)',
      );
    }

    const sku =
      activo.codigoInventario?.trim() ||
      activo.codigoQrToken?.trim() ||
      `ACT-${activo.id}`;
    const costoHistorico = Number(activo.costoAdquisicion ?? 0);
    const totalLinea =
      item.totalLineaNeto ??
      item.cantidad * item.precioUnitarioPactado;

    activo.estadoOperacional = EstadoOperacionalActivo.RESERVADO_VENTA;
    await manager.getRepository(Activo).save(activo);

    return manager.getRepository(CotizacionVentasDetalle).create({
      activoId,
      repuestoId: null,
      skuEstatico: sku,
      nombreEstatico: activo.nombre,
      categoriaEstatica: categoriaNombre,
      cantidad: item.cantidad,
      precioUnitarioPactado: String(item.precioUnitarioPactado),
      totalLineaNeto: String(Math.round(totalLinea * 100) / 100),
      costoHistoricoClp: String(costoHistorico),
    });
  }
}
