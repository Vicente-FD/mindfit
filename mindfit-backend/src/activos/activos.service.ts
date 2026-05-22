import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { EstadoOrdenTrabajo } from '../common/enums';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Activo } from '../entities/activo.entity';
import { Categoria } from '../entities/categoria.entity';
import { Marca } from '../entities/marca.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { categoriaEnumFromSigla } from './categoria-legacy.util';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CodigoInventarioService } from './codigo-inventario.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { CreateActivosResultDto } from './dto/create-activos-result.dto';
import { FilterActivosDto } from './dto/filter-activos.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
import {
  ActivoHistorialItemDto,
  HistorialUsuarioDto,
} from './dto/activo-historial.dto';
import { ActivoFichaDto } from './dto/activo-ficha.dto';

@Injectable()
export class ActivosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
    private readonly codigoInventario: CodigoInventarioService,
  ) {}

  private repo() {
    return this.transactionContext.getRepository(Activo, this.dataSource);
  }

  findAll(filters: FilterActivosDto = {}) {
    const qb = this.repo()
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.sucursal', 'sucursal')
      .leftJoinAndSelect('a.marcaRelacion', 'marca')
      .leftJoinAndSelect('a.categoriaRelacion', 'categoriaRelacion')
      .orderBy('a.nombre', 'ASC');

    if (filters.sucursalId != null) {
      qb.andWhere('a.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.marcaId != null) {
      qb.andWhere('a.marca_id = :marcaId', { marcaId: filters.marcaId });
    }
    if (filters.categoriaId != null) {
      qb.andWhere('a.categoria_id = :categoriaId', {
        categoriaId: filters.categoriaId,
      });
    } else if (filters.categoria) {
      qb.andWhere('a.categoria = :categoria', { categoria: filters.categoria });
    }
    if (filters.anioCompra != null) {
      qb.andWhere('EXTRACT(YEAR FROM a.fecha_compra) = :anio', {
        anio: filters.anioCompra,
      });
    }
    if (filters.busqueda?.trim()) {
      const q = `%${filters.busqueda.trim().toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(a.nombre) LIKE :q OR LOWER(a.codigo_inventario) LIKE :q OR LOWER(a.codigo_qr_token) LIKE :q)`,
        { q },
      );
    }

    qb.andWhere('a.deleted_at IS NULL');

    return qb.getMany();
  }

  async findOne(id: number) {
    const activo = await this.repo().findOne({
      where: { id },
      relations: { sucursal: true, marcaRelacion: true, categoriaRelacion: true },
    });
    if (!activo) {
      throw new NotFoundException(`Activo ${id} no encontrado`);
    }
    return activo;
  }

  private async resolvePisoAsignado(
    manager: EntityManager,
    sucursalId: number,
    pisoAsignado?: number | null,
  ): Promise<number | null> {
    const sucursal = await manager.findOne(Sucursal, { where: { id: sucursalId } });
    if (!sucursal) {
      throw new BadRequestException('Sucursal no encontrada');
    }
    const pisos = sucursal.cantidadPisos ?? 1;
    if (pisos <= 1) {
      return null;
    }
    if (pisoAsignado == null) {
      throw new BadRequestException(
        'Debe indicar el piso asignado para sedes con más de un nivel',
      );
    }
    if (pisoAsignado < 1 || pisoAsignado > pisos) {
      throw new BadRequestException(
        `El piso debe estar entre 1 y ${pisos} para esta sede`,
      );
    }
    return pisoAsignado;
  }

  async findByUuid(uuidActivo: string) {
    return this.findByPublicIdentifier(uuidActivo);
  }

  async findByPublicIdentifier(identifier: string) {
    let activo = await this.repo().findOne({
      where: { uuidActivo: identifier },
      relations: {
        sucursal: true,
        marcaRelacion: true,
        categoriaRelacion: true,
      },
    });

    if (!activo) {
      activo = await this.repo().findOne({
        where: [
          { codigoQrToken: identifier },
          { codigoInventario: identifier },
        ],
        relations: {
          sucursal: true,
          marcaRelacion: true,
          categoriaRelacion: true,
        },
      });
    }

    if (!activo) {
      throw new NotFoundException(
        `Activo con identificador ${identifier} no encontrado`,
      );
    }
    return activo;
  }

  async getFichaPublica(identifier: string): Promise<ActivoFichaDto> {
    const activo = await this.findByPublicIdentifier(identifier);
    const historial = await this.getHistorial(activo.id);

    const ordenesActivas = await this.dataSource.getRepository(OrdenTrabajo).find({
      where: {
        activoId: activo.id,
        estado: In([
          EstadoOrdenTrabajo.PENDIENTE,
          EstadoOrdenTrabajo.ASIGNADA,
          EstadoOrdenTrabajo.EN_PROCESO,
        ]),
      },
      relations: { asignadoA: true },
      order: { createdAt: 'DESC' },
    });

    return {
      activo: {
        id: activo.id,
        uuidActivo: activo.uuidActivo,
        codigoQrToken: activo.codigoQrToken ?? '',
        codigoInventario: activo.codigoInventario ?? '',
        nombre: activo.nombre,
        marca: activo.marcaRelacion?.nombre ?? activo.marca,
        modelo: activo.modelo,
        categoria:
          activo.categoriaRelacion?.nombre ??
          (activo.categoria != null ? String(activo.categoria) : ''),
        estadoOperacional: activo.estadoOperacional,
        sucursalId: activo.sucursalId,
        sucursalNombre: activo.sucursal?.nombre ?? null,
      },
      historial,
      ordenesActivas: ordenesActivas.map((o) => ({
        id: o.id,
        codigoOt: o.codigoOt,
        titulo: o.titulo,
        estado: o.estado,
        prioridad: o.prioridad,
        asignadoAId: o.asignadoAId,
        asignadoANombre: o.asignadoA?.nombre ?? null,
      })),
    };
  }

  async create(dto: CreateActivoDto): Promise<CreateActivosResultDto> {
    const cantidad = dto.cantidad ?? 1;

    if (cantidad > 1 && dto.numeroSerie) {
      throw new BadRequestException(
        'No puede indicar número de serie al registrar varias unidades iguales',
      );
    }

    if (cantidad === 1) {
      const activo = await this.createOne(dto);
      return { total: 1, activos: [activo] };
    }

    const activos = await this.createMany(dto, cantidad);
    return { total: activos.length, activos };
  }

  private async createOne(
    dto: CreateActivoDto,
    manager?: EntityManager,
  ): Promise<Activo> {
    const em = manager ?? this.transactionContext.getManager(this.dataSource);

    if (dto.numeroSerie) {
      const exists = await em.findOne(Activo, {
        where: { numeroSerie: dto.numeroSerie },
      });
      if (exists) {
        throw new ConflictException('Número de serie ya registrado');
      }
    }

    const saved = await this.persistActivo(em, dto);
    return this.findOne(saved.id);
  }

  private async createMany(
    dto: CreateActivoDto,
    cantidad: number,
  ): Promise<Activo[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const ids: number[] = [];

      for (let i = 0; i < cantidad; i++) {
        const saved = await this.persistActivo(manager, dto);
        ids.push(saved.id);
      }

      await queryRunner.commitTransaction();

      const creados: Activo[] = [];
      for (const id of ids) {
        creados.push(await this.findOne(id));
      }
      return creados;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async persistActivo(
    manager: EntityManager,
    dto: CreateActivoDto,
  ): Promise<Activo> {
    const marca = await manager.findOne(Marca, { where: { id: dto.marcaId } });
    if (!marca) {
      throw new BadRequestException('Marca no encontrada');
    }

    const categoria = await manager.findOne(Categoria, {
      where: { id: dto.categoriaId },
    });
    if (!categoria) {
      throw new BadRequestException('Categoría no encontrada');
    }

    const pisoAsignado = await this.resolvePisoAsignado(
      manager,
      dto.sucursalId,
      dto.pisoAsignado,
    );

    const codigo = await this.codigoInventario.generarCodigo(
      manager,
      dto.sucursalId,
      dto.marcaId,
      dto.categoriaId,
      dto.fechaCompra,
    );

    const activo = manager.create(Activo, {
      nombre: dto.nombre,
      marcaId: dto.marcaId,
      marca: marca.nombre,
      modelo: dto.modelo ?? null,
      numeroSerie: dto.numeroSerie ?? null,
      categoriaId: categoria.id,
      categoria: categoriaEnumFromSigla(categoria.sigla),
      pisoAsignado,
      sucursalId: dto.sucursalId,
      fechaCompra: dto.fechaCompra ?? null,
      fechaVencimientoGarantia: dto.fechaVencimientoGarantia ?? null,
      costoAdquisicion:
        dto.costoAdquisicion != null ? String(dto.costoAdquisicion) : null,
      documentacionUrls: dto.documentacionUrls ?? [],
      estadoOperacional: dto.estadoOperacional,
      codigoInventario: codigo,
      codigoQrToken: codigo,
    });

    return manager.save(activo);
  }

  async update(id: number, dto: UpdateActivoDto) {
    const activo = await this.findOne(id);

    if (dto.numeroSerie !== undefined && dto.numeroSerie !== activo.numeroSerie) {
      if (dto.numeroSerie) {
        const exists = await this.repo().findOne({
          where: { numeroSerie: dto.numeroSerie },
        });
        if (exists && exists.id !== id) {
          throw new ConflictException('Número de serie ya registrado');
        }
      }
      activo.numeroSerie = dto.numeroSerie || null;
    }

    if (dto.marcaId != null) {
      const marca = await this.dataSource
        .getRepository(Marca)
        .findOne({ where: { id: dto.marcaId } });
      if (!marca) {
        throw new BadRequestException('Marca no encontrada');
      }
      activo.marcaId = dto.marcaId;
      activo.marca = marca.nombre;
    }

    if (dto.nombre != null) activo.nombre = dto.nombre;
    if (dto.modelo !== undefined) activo.modelo = dto.modelo || null;
    if (dto.categoriaId != null) {
      const categoria = await this.dataSource
        .getRepository(Categoria)
        .findOne({ where: { id: dto.categoriaId } });
      if (!categoria) {
        throw new BadRequestException('Categoría no encontrada');
      }
      activo.categoriaId = categoria.id;
      activo.categoria = categoriaEnumFromSigla(categoria.sigla);
    }
    const sucursalId = dto.sucursalId ?? activo.sucursalId;
    if (dto.sucursalId != null) activo.sucursalId = dto.sucursalId;
    if (dto.pisoAsignado !== undefined || dto.sucursalId != null) {
      activo.pisoAsignado = await this.resolvePisoAsignado(
        this.transactionContext.getManager(this.dataSource),
        sucursalId,
        dto.pisoAsignado !== undefined ? dto.pisoAsignado : activo.pisoAsignado,
      );
    }
    if (dto.fechaCompra !== undefined) {
      activo.fechaCompra = dto.fechaCompra || null;
    }
    if (dto.fechaVencimientoGarantia !== undefined) {
      activo.fechaVencimientoGarantia = dto.fechaVencimientoGarantia || null;
    }
    if (dto.costoAdquisicion !== undefined) {
      activo.costoAdquisicion =
        dto.costoAdquisicion != null ? String(dto.costoAdquisicion) : null;
    }
    if (dto.documentacionUrls != null) {
      activo.documentacionUrls = dto.documentacionUrls;
    }
    if (dto.estadoOperacional != null) {
      activo.estadoOperacional = dto.estadoOperacional;
    }

    await this.repo().save(activo);
    return this.findOne(id);
  }

  async getHistorial(activoId: number): Promise<ActivoHistorialItemDto[]> {
    await this.findOne(activoId);

    const ordenes = await this.dataSource.getRepository(OrdenTrabajo).find({
      where: {
        activoId,
        estado: In([EstadoOrdenTrabajo.FINALIZADA, EstadoOrdenTrabajo.APROBADA]),
      },
      relations: {
        creadoPor: true,
        asignadoA: true,
        evidencias: true,
        comentarios: { autor: true },
      },
      order: {
        fechaFinReal: 'DESC',
        createdAt: 'DESC',
      },
    });

    return ordenes.map((o) => this.mapHistorialItem(o));
  }

  private mapHistorialItem(orden: OrdenTrabajo): ActivoHistorialItemDto {
    const fechaResolucion = orden.fechaFinReal ?? orden.updatedAt;
    return {
      id: orden.id,
      codigoOt: orden.codigoOt,
      titulo: orden.titulo,
      descripcion: orden.descripcion,
      prioridad: orden.prioridad,
      tipoMantenimiento: orden.tipoMantenimiento,
      estado: orden.estado,
      fechaResolucion: fechaResolucion ? fechaResolucion.toISOString() : null,
      duracionLabel: this.formatDuracion(
        orden.fechaInicioReal,
        orden.fechaFinReal,
      ),
      creadoPor: this.mapUsuario(orden.creadoPor),
      asignadoA: orden.asignadoA ? this.mapUsuario(orden.asignadoA) : null,
      comentarioCierre: this.resolveComentarioCierre(orden),
      evidencias: (orden.evidencias ?? []).map((e) => ({
        id: e.id,
        tipoEvidencia: e.tipoEvidencia,
        urlImagen: e.urlImagen,
        createdAt: e.createdAt.toISOString(),
      })),
      comentarios: (orden.comentarios ?? []).map((c) => ({
        id: c.id,
        comentario: c.comentario,
        autor: this.mapUsuario(c.autor),
        createdAt: c.createdAt.toISOString(),
      })),
    };
  }

  private mapUsuario(u: {
    id: number;
    nombre: string;
    email?: string;
    rol?: string;
  }): HistorialUsuarioDto {
    return {
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
    };
  }

  private resolveComentarioCierre(orden: OrdenTrabajo): string | null {
    const comentarios = orden.comentarios ?? [];
    if (comentarios.length === 0) return null;

    const sorted = [...comentarios].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    if (orden.asignadoAId) {
      const tecnico = sorted.find((c) => c.autorId === orden.asignadoAId);
      if (tecnico) return tecnico.comentario;
    }

    return sorted[0]?.comentario ?? null;
  }

  private formatDuracion(
    inicio: Date | null,
    fin: Date | null,
  ): string | null {
    if (!inicio || !fin) return null;
    const ms = fin.getTime() - inicio.getTime();
    if (ms <= 0) return null;
    const totalMin = Math.floor(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }

  async remove(id: number) {
    await this.findOne(id);
    const result = await this.repo().softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`Activo ${id} no encontrado`);
    }
    return { deleted: true };
  }
}
