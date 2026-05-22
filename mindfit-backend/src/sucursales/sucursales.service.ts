import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Sucursal } from '../entities/sucursal.entity';
import {
  ClasificacionOrden,
  EstadoOperacionalActivo,
  EstadoOrdenTrabajo,
  TipoEvidencia,
  TipoMantenimiento,
} from '../common/enums';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import {
  BitacoraTimelineItemDto,
  HistorialInfraDto,
  HistorialMaquinaDto,
  SucursalMonitoreoResponseDto,
  TrabajoEnCursoDto,
} from './dto/sucursal-monitoreo.dto';

export interface SucursalListItem {
  id: number;
  nombre: string;
  sigla: string;
  direccion: string | null;
  comuna: string | null;
  ciudad: string | null;
  estaActiva: boolean;
  cantidadPisos: number;
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
      cantidadPisos: s.cantidadPisos ?? 1,
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

  async getMonitoreo(sucursalId: number): Promise<SucursalMonitoreoResponseDto> {
    const sucursal = await this.findOne(sucursalId);
    const activoRepo = this.dataSource.getRepository(Activo);
    const otRepo = this.dataSource.getRepository(OrdenTrabajo);

    const activos = await activoRepo.find({
      where: { sucursalId, deletedAt: IsNull() },
    });

    const ordenes = await otRepo.find({
      where: { sucursalId, deletedAt: IsNull() },
      relations: {
        asignadoA: true,
        activo: true,
        evidencias: true,
        comentarios: true,
        sucursal: true,
      },
      order: { updatedAt: 'DESC' },
    });

    return this.buildMonitoreoPayload(
      {
        id: sucursal.id,
        nombre: sucursal.nombre,
        sigla: sucursal.sigla,
      },
      activos,
      ordenes,
      false,
    );
  }

  async getMonitoreoGlobal(): Promise<SucursalMonitoreoResponseDto> {
    const activoRepo = this.dataSource.getRepository(Activo);
    const otRepo = this.dataSource.getRepository(OrdenTrabajo);

    const activos = await activoRepo.find({
      where: { deletedAt: IsNull() },
    });

    const ordenes = await otRepo.find({
      where: { deletedAt: IsNull() },
      relations: {
        asignadoA: true,
        activo: true,
        evidencias: true,
        comentarios: true,
        sucursal: true,
      },
      order: { updatedAt: 'DESC' },
    });

    return this.buildMonitoreoPayload(
      {
        id: 0,
        nombre: 'Todas las sedes',
        sigla: 'GLOBAL',
      },
      activos,
      ordenes,
      true,
    );
  }

  private buildMonitoreoPayload(
    sucursal: { id: number; nombre: string; sigla: string },
    activos: Activo[],
    ordenes: OrdenTrabajo[],
    incluirSedeEnItems: boolean,
  ): SucursalMonitoreoResponseDto {
    const activosOperativos = activos.filter(
      (a) => a.estadoOperacional === EstadoOperacionalActivo.OPERATIVO,
    ).length;
    const activosFueraServicio = activos.filter(
      (a) => a.estadoOperacional === EstadoOperacionalActivo.FUERA_SERVICIO,
    ).length;
    const activosEnReparacion = activos.filter(
      (a) => a.estadoOperacional === EstadoOperacionalActivo.EN_REPARACION,
    ).length;

    const estadosResueltos = [
      EstadoOrdenTrabajo.FINALIZADA,
      EstadoOrdenTrabajo.APROBADA,
    ];
    const estadosEnCurso = [
      EstadoOrdenTrabajo.ASIGNADA,
      EstadoOrdenTrabajo.EN_PROCESO,
    ];

    const otsReportadas = ordenes.length;
    const otsResueltas = ordenes.filter((o) =>
      estadosResueltos.includes(o.estado),
    ).length;
    const porcentajeEfectividad =
      otsReportadas > 0
        ? Math.round((otsResueltas / otsReportadas) * 1000) / 10
        : 0;

    const trabajosEnCurso: TrabajoEnCursoDto[] = ordenes
      .filter((o) => estadosEnCurso.includes(o.estado))
      .map((o) => {
        const elapsed = this.elapsedFrom(o.fechaInicioReal);
        return {
          ordenId: o.id,
          codigoOt: o.codigoOt,
          titulo: o.titulo,
          clasificacion: o.clasificacion,
          estado: o.estado,
          tecnicoNombre: o.asignadoA?.nombre ?? null,
          fechaInicioReal: o.fechaInicioReal?.toISOString() ?? null,
          minutosTranscurridos: elapsed.minutos,
          tiempoTranscurridoLabel: elapsed.label,
          ...this.sedeRefOrden(o, incluirSedeEnItems),
        };
      });

    const historialInfraestructura: HistorialInfraDto[] = ordenes
      .filter(
        (o) =>
          estadosResueltos.includes(o.estado) &&
          (o.clasificacion === ClasificacionOrden.INFRAESTRUCTURA ||
            o.clasificacion === ClasificacionOrden.PETICION),
      )
      .map((o) => ({
        ordenId: o.id,
        codigoOt: o.codigoOt,
        reporteOriginal: o.descripcion?.trim() || o.titulo,
        prioridad: o.prioridad,
        clasificacion: o.clasificacion,
        fechaResolucion: this.resolutionDate(o).toISOString(),
        comentarioCierre: this.comentarioCierre(o),
        ...this.sedeRefOrden(o, incluirSedeEnItems),
      }));

    const historialMaquinas: HistorialMaquinaDto[] = ordenes
      .filter(
        (o) =>
          o.activoId != null &&
          estadosResueltos.includes(o.estado) &&
          (o.tipoMantenimiento === TipoMantenimiento.CORRECTIVO ||
            o.tipoMantenimiento === TipoMantenimiento.PREVENTIVO),
      )
      .map((o) => {
        const fotos = this.evidenciasAntesDespues(o);
        return {
          ordenId: o.id,
          codigoOt: o.codigoOt,
          titulo: o.titulo,
          activoId: o.activoId!,
          activoNombre: o.activo?.nombre ?? `Activo #${o.activoId}`,
          activoCodigo: o.activo?.codigoInventario ?? null,
          tipoMantenimiento: o.tipoMantenimiento,
          prioridad: o.prioridad,
          fechaResolucion: this.resolutionDate(o).toISOString(),
          comentarioCierre: this.comentarioCierre(o),
          fotoAntesUrl: fotos.antes,
          fotoDespuesUrl: fotos.despues,
          ...this.sedeRefOrden(o, incluirSedeEnItems),
        };
      });

    const bitacoraTimeline: BitacoraTimelineItemDto[] = ordenes
      .filter((o) => estadosResueltos.includes(o.estado))
      .map((o) => {
        const fotos = this.evidenciasAntesDespues(o);
        return {
          ordenId: o.id,
          codigoOt: o.codigoOt,
          titulo: o.titulo,
          clasificacion: o.clasificacion,
          tipoMantenimiento: o.tipoMantenimiento,
          prioridad: o.prioridad,
          fechaEvento: this.resolutionDate(o).toISOString(),
          tecnicoNombre: o.asignadoA?.nombre ?? null,
          comentarioCierre: this.comentarioCierre(o),
          fotoAntesUrl: fotos.antes,
          fotoDespuesUrl: fotos.despues,
          activoNombre: o.activo?.nombre ?? null,
          ...this.sedeRefOrden(o, incluirSedeEnItems),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime(),
      );

    return {
      sucursal,
      salud: {
        activosOperativos,
        activosFueraServicio,
        activosEnReparacion,
        porcentajeEfectividad,
        otsReportadas,
        otsResueltas,
      },
      trabajosEnCurso,
      historialInfraestructura,
      historialMaquinas,
      bitacoraTimeline,
      consultadoEn: new Date().toISOString(),
    };
  }

  private sedeRefOrden(
    orden: OrdenTrabajo,
    incluir: boolean,
  ): {
    sucursalId?: number;
    sucursalNombre?: string;
    sucursalSigla?: string;
  } {
    if (!incluir || !orden.sucursal) {
      return {};
    }
    return {
      sucursalId: orden.sucursal.id,
      sucursalNombre: orden.sucursal.nombre,
      sucursalSigla: orden.sucursal.sigla,
    };
  }

  private resolutionDate(orden: OrdenTrabajo): Date {
    return (
      orden.fechaAprobacion ??
      orden.fechaFinReal ??
      orden.updatedAt ??
      orden.createdAt
    );
  }

  private comentarioCierre(orden: OrdenTrabajo): string | null {
    const comentarios = orden.comentarios ?? [];
    if (!comentarios.length) return null;
    const sorted = [...comentarios].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted[0]?.comentario?.trim() ?? null;
  }

  private evidenciasAntesDespues(orden: OrdenTrabajo): {
    antes: string | null;
    despues: string | null;
  } {
    const evidencias = orden.evidencias ?? [];
    const antes =
      evidencias.find((e) => e.tipoEvidencia === TipoEvidencia.ANTES)
        ?.urlImagen ?? null;
    const despues =
      evidencias.find((e) => e.tipoEvidencia === TipoEvidencia.DESPUES)
        ?.urlImagen ?? null;
    return { antes, despues };
  }

  private elapsedFrom(fechaInicio: Date | null): {
    minutos: number;
    label: string;
  } {
    if (!fechaInicio) {
      return { minutos: 0, label: '—' };
    }
    const diffMs = Date.now() - new Date(fechaInicio).getTime();
    const totalMin = Math.max(0, Math.floor(diffMs / 60_000));
    const horas = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const label =
      horas > 0 ? `${horas}h ${mins.toString().padStart(2, '0')}m` : `${mins}m`;
    return { minutos: totalMin, label };
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
      cantidadPisos: dto.cantidadPisos ?? 1,
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
    if (dto.cantidadPisos != null) sucursal.cantidadPisos = dto.cantidadPisos;
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
