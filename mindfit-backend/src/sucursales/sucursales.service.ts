import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, IsNull } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Sucursal } from '../entities/sucursal.entity';
import {
  ClasificacionOrden,
  EstadoCotizacionVenta,
  EstadoOperacionalActivo,
  EstadoOrdenTrabajo,
  TipoEvidencia,
  TipoMantenimiento,
} from '../common/enums';
import { CotizacionVenta } from '../entities/cotizacion-venta.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { FacilidadesCriticasService } from '../facilidades-criticas/facilidades-criticas.service';
import type { FacilidadesResumenDto } from '../facilidades-criticas/dto/facilidad-critica-response.dto';
import {
  BitacoraTimelineItemDto,
  CotizacionPendienteMonitoreoDto,
  HistorialInfraDto,
  HistorialMaquinaDto,
  SedeSemaforoMonitoreoDto,
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
    private readonly facilidadesCriticasService: FacilidadesCriticasService,
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
    return this.fetchMonitoreoPayload(
      {
        id: sucursal.id,
        nombre: sucursal.nombre,
        sigla: sucursal.sigla,
      },
      sucursal.id,
      false,
    );
  }

  async getMonitoreoGlobal(): Promise<SucursalMonitoreoResponseDto> {
    return this.fetchMonitoreoPayload(
      {
        id: 0,
        nombre: 'Todas las sedes',
        sigla: 'GLOBAL',
      },
      undefined,
      true,
    );
  }

  /** Carga paralela de datos de monitoreo (evita awaits secuenciales bloqueantes). */
  private async fetchMonitoreoPayload(
    sucursal: { id: number; nombre: string; sigla: string },
    sucursalId: number | undefined,
    incluirSedeEnItems: boolean,
  ): Promise<SucursalMonitoreoResponseDto> {
    const [
      activos,
      ordenesEnCurso,
      cotizacionesPendientes,
      ordenesHistorial,
      otMetricas,
      facilidadesDetalle,
      sedesSemaforo,
    ] = await Promise.all([
      this.loadActivosMonitoreo(sucursalId),
      this.loadOrdenesEnCursoMonitoreo(sucursalId),
      this.loadCotizacionesPendientes(sucursalId),
      this.loadOrdenesHistorialMonitoreo(sucursalId),
      this.loadOtMetricasMonitoreo(sucursalId),
      sucursalId != null
        ? this.facilidadesCriticasService.getResumenSucursal(sucursalId)
        : Promise.resolve(null),
      sucursalId == null
        ? this.facilidadesCriticasService.getResumenGlobalSedes()
        : Promise.resolve([] as SedeSemaforoMonitoreoDto[]),
    ]);

    const ordenes = this.mergeOrdenesUnicas(ordenesEnCurso, ordenesHistorial);

    return this.buildMonitoreoPayload(
      sucursal,
      activos,
      ordenes,
      incluirSedeEnItems,
      cotizacionesPendientes,
      otMetricas,
      facilidadesDetalle,
      sedesSemaforo,
    );
  }

  private mergeOrdenesUnicas(
    enCurso: OrdenTrabajo[],
    historial: OrdenTrabajo[],
  ): OrdenTrabajo[] {
    const map = new Map<number, OrdenTrabajo>();
    for (const o of [...enCurso, ...historial]) {
      map.set(o.id, o);
    }
    return [...map.values()];
  }

  private loadActivosMonitoreo(sucursalId?: number): Promise<Activo[]> {
    const repo = this.dataSource.getRepository(Activo);
    return repo.find({
      where: {
        ...(sucursalId != null ? { sucursalId } : {}),
        deletedAt: IsNull(),
      },
      select: {
        id: true,
        sucursalId: true,
        estadoOperacional: true,
        nombre: true,
        codigoInventario: true,
      },
    });
  }

  private loadOrdenesEnCursoMonitoreo(
    sucursalId?: number,
  ): Promise<OrdenTrabajo[]> {
    const repo = this.dataSource.getRepository(OrdenTrabajo);
    return repo.find({
      where: {
        ...(sucursalId != null ? { sucursalId } : {}),
        deletedAt: IsNull(),
        estado: In([
          EstadoOrdenTrabajo.ASIGNADA,
          EstadoOrdenTrabajo.EN_PROCESO,
        ]),
      },
      relations: {
        asignadoA: true,
        activo: true,
        sucursal: true,
      },
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  private loadOrdenesHistorialMonitoreo(
    sucursalId?: number,
  ): Promise<OrdenTrabajo[]> {
    const qb = this.dataSource
      .getRepository(OrdenTrabajo)
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.asignadoA', 'asignadoA')
      .leftJoinAndSelect('o.activo', 'activo')
      .leftJoinAndSelect('o.evidencias', 'evidencias')
      .leftJoinAndSelect('o.comentarios', 'comentarios')
      .leftJoinAndSelect('o.sucursal', 'sucursal')
      .where('o.deleted_at IS NULL')
      .andWhere('o.estado IN (:...estados)', {
        estados: [
          EstadoOrdenTrabajo.FINALIZADA,
          EstadoOrdenTrabajo.APROBADA,
        ],
      })
      .orderBy('o.updated_at', 'DESC')
      .take(sucursalId != null ? 120 : 200);

    if (sucursalId != null) {
      qb.andWhere('o.sucursal_id = :sid', { sid: sucursalId });
    }

    return qb.getMany();
  }

  private async loadOtMetricasMonitoreo(sucursalId?: number): Promise<{
    otsReportadas: number;
    otsResueltas: number;
  }> {
    const repo = this.dataSource.getRepository(OrdenTrabajo);
    const baseWhere = {
      ...(sucursalId != null ? { sucursalId } : {}),
      deletedAt: IsNull(),
    };

    const [otsReportadas, otsResueltas] = await Promise.all([
      repo.count({ where: baseWhere }),
      repo.count({
        where: {
          ...baseWhere,
          estado: In([
            EstadoOrdenTrabajo.FINALIZADA,
            EstadoOrdenTrabajo.APROBADA,
          ]),
        },
      }),
    ]);

    return { otsReportadas, otsResueltas };
  }

  private async loadCotizacionesPendientes(
    sucursalId?: number,
  ): Promise<CotizacionPendienteMonitoreoDto[]> {
    const qb = this.dataSource
      .getRepository(CotizacionVenta)
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.cliente', 'cliente')
      .leftJoinAndSelect('c.creadoPor', 'creadoPor')
      .where('c.estado = :estado', {
        estado: EstadoCotizacionVenta.PENDIENTE_APROBACION,
      })
      .orderBy('c.createdAt', 'DESC')
      .take(30);

    if (sucursalId != null && sucursalId > 0) {
      qb.andWhere('creadoPor.sucursal_id = :sid', { sid: sucursalId });
    }

    const rows = await qb.getMany();
    return rows.map((c) => ({
      id: c.id,
      folio: c.folio,
      clienteRazonSocial: c.cliente?.razonSocial ?? '—',
      ejecutivoNombre: c.creadoPor?.nombre ?? null,
      montoBruto: Number(c.montoBruto),
      divisaCodigo: c.divisaCodigo,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  private buildMonitoreoPayload(
    sucursal: { id: number; nombre: string; sigla: string },
    activos: Activo[],
    ordenes: OrdenTrabajo[],
    incluirSedeEnItems: boolean,
    cotizacionesPendientes: CotizacionPendienteMonitoreoDto[],
    otMetricas?: { otsReportadas: number; otsResueltas: number },
    facilidadesDetalle?: FacilidadesResumenDto | null,
    sedesSemaforo: SedeSemaforoMonitoreoDto[] = [],
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

    const otsReportadas = otMetricas?.otsReportadas ?? ordenes.length;
    const otsResueltas =
      otMetricas?.otsResueltas ??
      ordenes.filter((o) => estadosResueltos.includes(o.estado)).length;
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
          activoNombre: o.activo?.nombre ?? null,
          activoCodigo: o.activo?.codigoInventario ?? null,
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
      facilidadesCriticas: facilidadesDetalle
        ? {
            semaforo: facilidadesDetalle.semaforo,
            operativas: facilidadesDetalle.operativas,
            enMantenimiento: facilidadesDetalle.enMantenimiento,
            fueraDeServicio: facilidadesDetalle.fueraDeServicio,
            items: facilidadesDetalle.items.map((i) => ({
              id: i.id,
              tipo: i.tipo,
              tipoLabel: i.tipoLabel,
              estado: i.estado,
              notasTecnicas: i.notasTecnicas,
              fallosHistoricos: i.fallosHistoricos,
            })),
          }
        : null,
      sedesSemaforoFacilidades: sedesSemaforo,
      trabajosEnCurso,
      cotizacionesPendientes,
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
      const saved = await this.repo().save(sucursal);
      await this.facilidadesCriticasService.ensurePlantillaSucursal(saved.id);
      return saved;
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
