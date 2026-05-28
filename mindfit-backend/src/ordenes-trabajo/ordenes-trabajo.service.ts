import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { Brackets, DataSource, EntityManager, In } from 'typeorm';
import {
  ClasificacionOrden,
  EstadoFacilidadCritica,
  EstadoOperacionalActivo,
  EstadoOrdenTrabajo,
  PrioridadOrden,
  RolUsuario,
  TipoFacilidadCritica,
  TipoEvidencia,
  TipoMantenimiento,
} from '../common/enums';
import { Usuario } from '../entities/usuario.entity';
import { Activo } from '../entities/activo.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { EvidenciaOt } from '../entities/evidencia-ot.entity';
import { ComentarioOt } from '../entities/comentario-ot.entity';
import { BulkOrdenTrabajoItemDto } from './dto/bulk-orden-trabajo-item.dto';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { AsignarOrdenDto } from './dto/asignar-orden.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { CerrarOrdenDto } from './dto/cerrar-orden.dto';
import { nextOtCodigo } from './ot-codigo.sequence';
import { agentDebugLog } from '../common/agent-debug-log';
import { InventarioService } from '../inventario/inventario.service';
import { RepuestoConsumoItemDto } from '../inventario/dto/repuesto-consumo.dto';
import { resolveEvidenciaDiskPath } from './storage/evidencias.storage';
import { TipoReporteSucursal } from './dto/tipo-reporte-sucursal';
import { resolveTipoFacilidad } from '../common/utils/facilidades-criticas.util';
import { FacilidadCritica } from '../entities/facilidad-critica.entity';
import { FacilidadCriticaHistorial } from '../entities/facilidad-critica-historial.entity';
import {
  CalendarioOrdenesResponseDto,
  OrdenTrabajoCalendarioItem,
} from './dto/calendario-ordenes-response.dto';

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
    private readonly inventarioService: InventarioService,
  ) {}

  private ordenRepo() {
    return this.transactionContext.getRepository(OrdenTrabajo, this.dataSource);
  }

  private evidenciaRepo() {
    return this.transactionContext.getRepository(EvidenciaOt, this.dataSource);
  }

  private comentarioRepo() {
    return this.transactionContext.getRepository(ComentarioOt, this.dataSource);
  }

  private async generarCodigoOt(): Promise<string> {
    const manager = this.transactionContext.getManager(this.dataSource);
    return nextOtCodigo((sql) => manager.query(sql));
  }

  private manager(): EntityManager {
    return this.transactionContext.getManager(this.dataSource);
  }

  /** OTs correctivas que mantienen el activo fuera de operación normal. */
  private static readonly ESTADOS_OT_BLOQUEAN_OPERATIVO: EstadoOrdenTrabajo[] = [
    EstadoOrdenTrabajo.PENDIENTE,
    EstadoOrdenTrabajo.ASIGNADA,
    EstadoOrdenTrabajo.EN_PROCESO,
    EstadoOrdenTrabajo.FINALIZADA,
  ];

  private async actualizarEstadoActivo(
    manager: EntityManager,
    activoId: number,
    estado: EstadoOperacionalActivo,
  ): Promise<void> {
    await manager.update(Activo, activoId, { estadoOperacional: estado });
  }

  private async contarOtCorrectivasAbiertas(
    manager: EntityManager,
    activoId: number,
    excluirOtId?: number,
  ): Promise<number> {
    const qb = manager
      .getRepository(OrdenTrabajo)
      .createQueryBuilder('ot')
      .where('ot.activo_id = :activoId', { activoId })
      .andWhere('ot.tipo_mantenimiento = :tipo', {
        tipo: TipoMantenimiento.CORRECTIVO,
      })
      .andWhere('ot.estado IN (:...estados)', {
        estados: OrdenesTrabajoService.ESTADOS_OT_BLOQUEAN_OPERATIVO,
      })
      .andWhere('ot.deleted_at IS NULL');

    if (excluirOtId != null) {
      qb.andWhere('ot.id != :excluirOtId', { excluirOtId });
    }

    return qb.getCount();
  }

  private async restaurarActivoOperativoSiAplica(
    manager: EntityManager,
    activoId: number,
    excluirOtId?: number,
  ): Promise<void> {
    const abiertas = await this.contarOtCorrectivasAbiertas(
      manager,
      activoId,
      excluirOtId,
    );
    if (abiertas === 0) {
      await this.actualizarEstadoActivo(
        manager,
        activoId,
        EstadoOperacionalActivo.OPERATIVO,
      );
    }
  }

  private async syncActivoAlCrearOt(
    manager: EntityManager,
    orden: OrdenTrabajo,
  ): Promise<void> {
    if (orden.activoId == null) return;
    if (orden.tipoMantenimiento !== TipoMantenimiento.CORRECTIVO) return;

    await this.actualizarEstadoActivo(
      manager,
      orden.activoId,
      EstadoOperacionalActivo.FUERA_SERVICIO,
    );
  }

  private estadoActivoAlIniciarTrabajo(
    tipoMantenimiento: TipoMantenimiento,
  ): EstadoOperacionalActivo {
    if (tipoMantenimiento === TipoMantenimiento.PREVENTIVO) {
      return EstadoOperacionalActivo.MANTENIMIENTO_PREVENTIVO;
    }
    return EstadoOperacionalActivo.EN_REPARACION;
  }

  private async syncActivoAlIniciarTrabajo(
    manager: EntityManager,
    orden: OrdenTrabajo,
  ): Promise<void> {
    if (orden.activoId == null) return;
    if (
      orden.tipoMantenimiento !== TipoMantenimiento.CORRECTIVO &&
      orden.tipoMantenimiento !== TipoMantenimiento.PREVENTIVO
    ) {
      return;
    }

    await this.actualizarEstadoActivo(
      manager,
      orden.activoId,
      this.estadoActivoAlIniciarTrabajo(orden.tipoMantenimiento),
    );
  }

  private async syncActivoTrasCierreOt(
    manager: EntityManager,
    orden: OrdenTrabajo,
  ): Promise<void> {
    if (orden.activoId == null) return;
    if (orden.tipoMantenimiento !== TipoMantenimiento.CORRECTIVO) return;

    if (
      orden.estado === EstadoOrdenTrabajo.APROBADA ||
      orden.estado === EstadoOrdenTrabajo.RECHAZADA
    ) {
      await this.restaurarActivoOperativoSiAplica(
        manager,
        orden.activoId,
        orden.id,
      );
      return;
    }

    if (orden.estado === EstadoOrdenTrabajo.EN_PROCESO) {
      await this.actualizarEstadoActivo(
        manager,
        orden.activoId,
        EstadoOperacionalActivo.EN_REPARACION,
      );
    }
  }

  findAll(filters?: {
    tecnicoId?: number;
    sucursalId?: number;
    estado?: 'activas' | 'por_aprobar' | 'finalizadas';
    fechaInicio?: string;
    fechaFin?: string;
    includeComentarios?: boolean;
    includeEvidencias?: boolean;
  }) {
    const qb = this.ordenRepo()
      .createQueryBuilder('ot')
      .leftJoinAndSelect('ot.activo', 'activo')
      .leftJoinAndSelect('ot.sucursal', 'sucursal')
      .leftJoinAndSelect('ot.creadoPor', 'creadoPor')
      .leftJoinAndSelect('ot.asignadoA', 'asignadoA')
      .orderBy('ot.createdAt', 'DESC');

    if (filters?.includeComentarios) {
      qb.leftJoinAndSelect('ot.comentarios', 'comentarios');
    }

    if (filters?.includeEvidencias) {
      qb.leftJoinAndSelect('ot.evidencias', 'evidencias');
    }

    if (filters?.tecnicoId) {
      qb.andWhere('ot.asignado_a_id = :tecnicoId', {
        tecnicoId: filters.tecnicoId,
      });
    }
    if (filters?.sucursalId) {
      qb.andWhere('ot.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }

    if (filters?.estado === 'activas') {
      qb.andWhere('ot.estado IN (:...estadosActivos)', {
        estadosActivos: [
          EstadoOrdenTrabajo.PENDIENTE,
          EstadoOrdenTrabajo.ASIGNADA,
          EstadoOrdenTrabajo.EN_PROCESO,
        ],
      });
    } else if (filters?.estado === 'por_aprobar') {
      qb.andWhere('ot.estado = :estadoPorAprobar', {
        estadoPorAprobar: EstadoOrdenTrabajo.FINALIZADA,
      });
    } else if (filters?.estado === 'finalizadas') {
      qb.andWhere('ot.estado IN (:...estadoArchivo)', {
        estadoArchivo: [
          EstadoOrdenTrabajo.APROBADA,
          EstadoOrdenTrabajo.RECHAZADA,
        ],
      });
    }

    if (filters?.fechaInicio) {
      qb.andWhere('ot.created_at >= :fechaInicio', {
        fechaInicio: this.startOfDay(filters.fechaInicio),
      });
    }
    if (filters?.fechaFin) {
      qb.andWhere('ot.created_at <= :fechaFin', {
        fechaFin: this.endOfDay(filters.fechaFin),
      });
    }

    qb.andWhere('ot.deleted_at IS NULL');

    return qb.getMany();
  }

  private startOfDay(isoDate: string): Date {
    const d = new Date(isoDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private boundsForMes(mes: string): {
    mes: string;
    desde: string;
    hasta: string;
  } {
    const [y, m] = mes.split('-').map(Number);
    const year = y;
    const monthIndex = m - 1;
    const mesKey = `${year}-${String(m).padStart(2, '0')}`;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const hasta = `${mesKey}-${String(lastDay).padStart(2, '0')}`;
    return { mes: mesKey, desde: `${mesKey}-01`, hasta };
  }

  async findCalendario(
    mes: string,
    sucursalId?: number,
  ): Promise<CalendarioOrdenesResponseDto> {
    const { mes: mesKey, desde, hasta } = this.boundsForMes(mes);
    const monthStart = this.startOfDay(desde);
    const monthEnd = this.endOfDay(hasta);

    const qb = this.ordenRepo()
      .createQueryBuilder('ot')
      .leftJoinAndSelect('ot.activo', 'activo')
      .leftJoinAndSelect('ot.sucursal', 'sucursal')
      .leftJoinAndSelect('ot.asignadoA', 'asignadoA')
      .where('ot.deleted_at IS NULL');

    if (sucursalId != null) {
      qb.andWhere('ot.sucursal_id = :sucursalId', { sucursalId });
    }

    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where('ot.created_at BETWEEN :monthStart AND :monthEnd', {
            monthStart,
            monthEnd,
          })
          .orWhere('ot.fecha_inicio_real BETWEEN :monthStart AND :monthEnd', {
            monthStart,
            monthEnd,
          })
          .orWhere('ot.fecha_fin_real BETWEEN :monthStart AND :monthEnd', {
            monthStart,
            monthEnd,
          })
          .orWhere(
            new Brackets((continua) => {
              continua
                .where('ot.fecha_inicio_real IS NOT NULL')
                .andWhere('ot.fecha_inicio_real < :monthStart', { monthStart })
                .andWhere('ot.estado IN (:...estadosContinuo)', {
                  estadosContinuo: [
                    EstadoOrdenTrabajo.EN_PROCESO,
                    EstadoOrdenTrabajo.FINALIZADA,
                  ],
                })
                .andWhere(
                  new Brackets((fin) => {
                    fin
                      .where('ot.fecha_fin_real IS NULL')
                      .orWhere('ot.fecha_fin_real >= :monthStart', {
                        monthStart,
                      });
                  }),
                );
            }),
          );
      }),
    );

    qb.orderBy('ot.created_at', 'ASC');

    const rows = await qb.getMany();
    const ordenes: OrdenTrabajoCalendarioItem[] = rows.map((ot) => ({
      ...ot,
      tecnicoAsignado: ot.asignadoA,
    }));

    return { mes: mesKey, total: ordenes.length, ordenes };
  }

  private endOfDay(isoDate: string): Date {
    const d = new Date(isoDate);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  async findOne(id: number) {
    const orden = await this.ordenRepo().findOne({
      where: { id },
      relations: {
        activo: true,
        sucursal: true,
        creadoPor: true,
        asignadoA: true,
        evidencias: true,
        comentarios: { autor: true },
      },
    });
    if (!orden) {
      throw new NotFoundException(`Orden de trabajo ${id} no encontrada`);
    }
    return orden;
  }

  async findBySucursal(sucursalId: number) {
    return this.findAll({ sucursalId });
  }

  async reportarFalla(
    dto: {
      tipoReporte: TipoReporteSucursal;
      activoId?: number | null;
      descripcion: string;
      prioridad: PrioridadOrden;
      titulo?: string;
      asignadoAId?: number;
      facilidadCriticaId?: number;
      areaServicios?: 'bano' | 'camarin' | 'ducha';
      generoServicios?: 'hombres' | 'mujeres';
      generosServicios?: string;
      fallaGeneralServicios?: string;
    },
    creadoPorId: number,
    sucursalId: number,
    fotoUrl?: string,
  ) {
    const tipo = dto.tipoReporte ?? 'maquina';
    const esMaquina = tipo === 'maquina';
    const serviciosAfectados = this.resolveServiciosAfectados(dto);

    if (esMaquina && (dto.activoId == null || Number.isNaN(Number(dto.activoId)))) {
      throw new BadRequestException(
        'Debe seleccionar un activo para reportes de máquina',
      );
    }

    const tituloPorTipo: Record<TipoReporteSucursal, string> = {
      maquina: dto.titulo ?? `Reporte de falla - Activo #${dto.activoId}`,
      infraestructura:
        dto.titulo ?? 'Incidente de infraestructura / instalaciones',
      peticion: dto.titulo ?? 'Petición de elementos o servicios',
    };

    const clasificacionMap: Record<TipoReporteSucursal, ClasificacionOrden> = {
      maquina: ClasificacionOrden.MAQUINA,
      infraestructura: ClasificacionOrden.INFRAESTRUCTURA,
      peticion: ClasificacionOrden.PETICION,
    };

    const orden = await this.create(
      {
        clasificacion: clasificacionMap[tipo],
        activoId: esMaquina ? Number(dto.activoId) : undefined,
        sucursalId,
        titulo: tituloPorTipo[tipo],
        descripcion: dto.descripcion,
        prioridad: dto.prioridad,
        tipoMantenimiento: TipoMantenimiento.CORRECTIVO,
        facilidadCriticaId: dto.facilidadCriticaId,
        areaServicios: dto.areaServicios,
        generoServicios: dto.generoServicios,
        fallaGeneralServicios: ['true', '1'].includes(
          String(dto.fallaGeneralServicios ?? '').toLowerCase(),
        ),
        serviciosAfectados,
      },
      creadoPorId,
    );

    if (fotoUrl) {
      await this.agregarEvidencia(orden.id, creadoPorId, {
        tipoEvidencia: TipoEvidencia.ANTES,
        urlImagen: fotoUrl,
      });
    }

    if (dto.asignadoAId != null && !Number.isNaN(Number(dto.asignadoAId))) {
      await this.asignar(orden.id, { tecnicoId: Number(dto.asignadoAId) });
    }

    await this.syncAreaServiciosDesdeReporte(
      {
        tipoReporte: tipo,
        areaServicios: dto.areaServicios,
        generoServicios: dto.generoServicios,
        generosServicios: dto.generosServicios,
        fallaGeneralServicios: dto.fallaGeneralServicios,
        descripcion: dto.descripcion,
        serviciosAfectados,
      },
      creadoPorId,
      sucursalId,
      orden.id,
    );

    return this.findOne(orden.id);
  }

  private async syncAreaServiciosDesdeReporte(
    dto: {
      tipoReporte: TipoReporteSucursal;
      areaServicios?: 'bano' | 'camarin' | 'ducha';
      generoServicios?: 'hombres' | 'mujeres';
      generosServicios?: string;
      fallaGeneralServicios?: string;
      descripcion: string;
      serviciosAfectados: string[];
    },
    userId: number,
    sucursalId: number,
    ordenId: number,
  ): Promise<void> {
    const esGeneral = ['true', '1'].includes(
      String(dto.fallaGeneralServicios ?? '').toLowerCase(),
    );
    const esServicios =
      dto.tipoReporte === 'infraestructura' &&
      (esGeneral || (!!dto.areaServicios && !!dto.serviciosAfectados.length));
    if (!esServicios) return;

    const manager = this.manager();
    const repo = manager.getRepository(FacilidadCritica);
    const historialRepo = manager.getRepository(FacilidadCriticaHistorial);

    const tiposObjetivo = dto.serviciosAfectados as TipoFacilidadCritica[];

    for (const tipo of tiposObjetivo) {
      let facilidad = await repo.findOne({ where: { sucursalId, tipo } });
      if (!facilidad) {
        facilidad = await repo.save(
          repo.create({
            sucursalId,
            tipo,
            estado: EstadoFacilidadCritica.OPERATIVO,
          }),
        );
      }

      const estadoAnterior = facilidad.estado;
      facilidad.estado = EstadoFacilidadCritica.FUERA_DE_SERVICIO;
      facilidad.notasTecnicas = dto.descripcion;
      facilidad.actualizadoPorId = userId;
      await repo.save(facilidad);

      await historialRepo.save({
        facilidadCriticaId: facilidad.id,
        estadoAnterior,
        estadoNuevo: EstadoFacilidadCritica.FUERA_DE_SERVICIO,
        descripcionProblema: dto.descripcion,
        reportadoPorId: userId,
      });

      if (!esGeneral && tiposObjetivo.length === 1) {
        await manager.update(OrdenTrabajo, ordenId, {
          facilidadCriticaId: facilidad.id,
        });
        break;
      }
    }
  }

  private resolveServiciosAfectados(dto: {
    tipoReporte: TipoReporteSucursal;
    areaServicios?: 'bano' | 'camarin' | 'ducha';
    generoServicios?: 'hombres' | 'mujeres';
    generosServicios?: string;
    fallaGeneralServicios?: string;
  }): string[] {
    const esServicios = dto.tipoReporte === 'infraestructura';
    if (!esServicios) return [];
    const esGeneral = ['true', '1'].includes(
      String(dto.fallaGeneralServicios ?? '').toLowerCase(),
    );
    if (esGeneral) {
      return [
        TipoFacilidadCritica.BANO_HOMBRES,
        TipoFacilidadCritica.BANO_MUJERES,
        TipoFacilidadCritica.CAMARIN_HOMBRES,
        TipoFacilidadCritica.CAMARIN_MUJERES,
        TipoFacilidadCritica.DUCHAS_HOMBRES,
        TipoFacilidadCritica.DUCHAS_MUJERES,
      ];
    }
    if (!dto.areaServicios) return [];
    const generos = (dto.generosServicios ?? dto.generoServicios ?? '')
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g === 'hombres' || g === 'mujeres') as Array<
      'hombres' | 'mujeres'
    >;
    const finalGeneros =
      generos.length > 0 ? generos : (['hombres'] as Array<'hombres' | 'mujeres'>);
    return finalGeneros.map((g) => resolveTipoFacilidad(dto.areaServicios!, g));
  }

  /**
   * Elimina evidencias "despues" (registro + archivo físico). Conserva "antes".
   */
  private async eliminarEvidenciasDespues(
    manager: EntityManager,
    ordenId: number,
  ): Promise<void> {
    const repo = manager.getRepository(EvidenciaOt);
    const evidencias = await repo.find({
      where: {
        ordenTrabajoId: ordenId,
        tipoEvidencia: TipoEvidencia.DESPUES,
      },
    });

    for (const evidencia of evidencias) {
      const diskPath = resolveEvidenciaDiskPath(evidencia.urlImagen);
      if (diskPath) {
        try {
          await unlink(diskPath);
        } catch (err) {
          const code = (err as NodeJS.ErrnoException).code;
          if (code !== 'ENOENT') {
            throw err;
          }
        }
      }
      await repo.delete(evidencia.id);
    }
  }

  async create(dto: CreateOrdenTrabajoDto, creadoPorId: number) {
    const manager = this.manager();
    const id = await this.persistOrdenInManager(
      manager,
      dto,
      creadoPorId,
    );
    return this.findOne(id);
  }

  async createBulk(
    tasks: BulkOrdenTrabajoItemDto[],
    creadoPorId: number,
  ): Promise<{ created: OrdenTrabajo[]; total: number }> {
    if (!tasks?.length) {
      throw new BadRequestException(
        'Debe enviar al menos una tarea en el plan semanal',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.transactionContext.setManager(queryRunner.manager);
      const ids: number[] = [];

      for (const task of tasks) {
        const id = await this.persistOrdenInManager(
          queryRunner.manager,
          task,
          creadoPorId,
        );
        ids.push(id);
      }

      await queryRunner.commitTransaction();

      const created = await Promise.all(
        ids.map((id) => this.findOne(id)),
      );
      return { created, total: created.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      this.transactionContext.clearManager();
      await queryRunner.release();
    }
  }

  private async persistOrdenInManager(
    manager: EntityManager,
    dto: BulkOrdenTrabajoItemDto,
    creadoPorId: number,
  ): Promise<number> {
    const clasificacion = dto.clasificacion ?? ClasificacionOrden.MAQUINA;

    if (clasificacion === ClasificacionOrden.MAQUINA) {
      if (dto.activoId == null) {
        throw new BadRequestException(
          'activoId es obligatorio para OT de máquina',
        );
      }
      const activo = await manager.findOne(Activo, {
        where: { id: dto.activoId },
      });
      if (!activo) {
        throw new BadRequestException('Activo no encontrado');
      }
      if (activo.sucursalId !== dto.sucursalId) {
        throw new BadRequestException(
          'El activo no pertenece a la sucursal seleccionada',
        );
      }
    }

    const fechaProgramacion = dto.fechaProgramacion
      ? new Date(dto.fechaProgramacion)
      : null;
    const asignadoAId = dto.asignadoAId ?? null;

    let estado = EstadoOrdenTrabajo.PENDIENTE;
    if (asignadoAId != null) {
      const tecnico = await manager.findOne(Usuario, {
        where: { id: asignadoAId, rol: RolUsuario.TECNICO },
      });
      if (!tecnico?.estaActivo) {
        throw new BadRequestException('Técnico no válido o inactivo');
      }
      if (asignadoAId != null && fechaProgramacion) {
        estado = EstadoOrdenTrabajo.ASIGNADA;
      }
    }

    const codigoOt = await nextOtCodigo((sql) => manager.query(sql));

    const orden = manager.create(OrdenTrabajo, {
      codigoOt,
      clasificacion,
      activoId:
        clasificacion === ClasificacionOrden.MAQUINA
          ? (dto.activoId ?? null)
          : null,
      facilidadCriticaId: dto.facilidadCriticaId ?? null,
      areaServicios: dto.areaServicios ?? null,
      generoServicios: dto.generoServicios ?? null,
      fallaGeneralServicios: dto.fallaGeneralServicios ?? false,
      sucursalId: dto.sucursalId,
      creadoPorId,
      asignadoAId,
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion?.trim() ?? null,
      prioridad: dto.prioridad ?? PrioridadOrden.MEDIA,
      tipoMantenimiento: dto.tipoMantenimiento,
      estado,
      tiempoEstimadoMinutos: dto.tiempoEstimadoMinutos ?? null,
      fechaProgramacion,
    });

    const saved = await manager.save(OrdenTrabajo, orden);
    await this.syncActivoAlCrearOt(manager, saved);
    return saved.id;
  }

  private assertOrdenEditable(estado: EstadoOrdenTrabajo): void {
    if (
      estado === EstadoOrdenTrabajo.FINALIZADA ||
      estado === EstadoOrdenTrabajo.APROBADA ||
      estado === EstadoOrdenTrabajo.RECHAZADA
    ) {
      throw new BadRequestException(
        'No se puede modificar una orden finalizada o aprobada',
      );
    }
  }

  async update(id: number, dto: UpdateOrdenTrabajoDto) {
    const orden = await this.findOne(id);
    this.assertOrdenEditable(orden.estado);
    const manager = this.transactionContext.getManager(this.dataSource);

    if (dto.titulo != null) orden.titulo = dto.titulo;
    if (dto.descripcion !== undefined) {
      orden.descripcion = dto.descripcion || null;
    }
    if (dto.prioridad != null) orden.prioridad = dto.prioridad;

    if (dto.clasificacion != null) {
      orden.clasificacion = dto.clasificacion;
      if (dto.clasificacion === ClasificacionOrden.INFRAESTRUCTURA) {
        orden.activoId = null;
      }
    }

    const clasificacionEfectiva =
      dto.clasificacion ?? orden.clasificacion ?? ClasificacionOrden.MAQUINA;

    if (clasificacionEfectiva === ClasificacionOrden.MAQUINA) {
      if (dto.activoId !== undefined) {
        if (dto.activoId == null) {
          throw new BadRequestException(
            'activoId es obligatorio para OT de máquina',
          );
        }
        const activo = await manager.findOne(Activo, {
          where: { id: dto.activoId },
        });
        if (!activo) {
          throw new BadRequestException('Activo no encontrado');
        }
        if (activo.sucursalId !== orden.sucursalId) {
          throw new BadRequestException(
            'El activo no pertenece a la sucursal de la OT',
          );
        }
        orden.activoId = dto.activoId;
      } else if (
        dto.clasificacion === ClasificacionOrden.MAQUINA &&
        orden.activoId == null
      ) {
        throw new BadRequestException(
          'Debe indicar activoId al clasificar como máquina',
        );
      }
    }

    if (dto.asignadoAId !== undefined) {
      if (dto.asignadoAId == null) {
        orden.asignadoAId = null;
        if (orden.estado === EstadoOrdenTrabajo.ASIGNADA) {
          orden.estado = EstadoOrdenTrabajo.PENDIENTE;
        }
      } else {
        const tecnico = await manager.findOne(Usuario, {
          where: { id: dto.asignadoAId, rol: RolUsuario.TECNICO },
        });
        if (!tecnico?.estaActivo) {
          throw new BadRequestException('Técnico no válido o inactivo');
        }
        orden.asignadoAId = dto.asignadoAId;
        if (orden.estado === EstadoOrdenTrabajo.PENDIENTE) {
          orden.estado = EstadoOrdenTrabajo.ASIGNADA;
        }
      }
    }

    await this.ordenRepo().save(orden);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const orden = await this.findOne(id);
    this.assertOrdenEditable(orden.estado);
    const result = await this.ordenRepo().softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`Orden de trabajo ${id} no encontrada`);
    }
  }

  async asignar(id: number, dto: AsignarOrdenDto) {
    const manager = this.transactionContext.getManager(this.dataSource);
    const tecnico = await manager.findOne(Usuario, {
      where: { id: dto.tecnicoId, rol: RolUsuario.TECNICO },
    });
    if (!tecnico?.estaActivo) {
      throw new BadRequestException('Técnico no válido o inactivo');
    }

    const orden = await this.findOne(id);
    if (
      orden.estado !== EstadoOrdenTrabajo.PENDIENTE &&
      orden.estado !== EstadoOrdenTrabajo.ASIGNADA
    ) {
      throw new BadRequestException(
        'Solo se puede asignar técnico en OT pendiente o asignada',
      );
    }

    orden.asignadoAId = dto.tecnicoId;
    orden.estado = EstadoOrdenTrabajo.ASIGNADA;
    await this.ordenRepo().save(orden);

    const updated = await this.findOne(id);
    return {
      ...updated,
      tecnicoAsignado: updated.asignadoA,
    };
  }

  async updateEstado(
    id: number,
    estado: EstadoOrdenTrabajo,
    tecnicoId: number,
    urlFotoAntes?: string,
  ) {
    if (estado === EstadoOrdenTrabajo.EN_PROCESO) {
      if (!urlFotoAntes) {
        throw new BadRequestException(
          'La foto_antes es obligatoria para iniciar el trabajo',
        );
      }
      return this.iniciarConEvidencia(id, tecnicoId, urlFotoAntes);
    }
    throw new BadRequestException(
      `Transición de estado no permitida para el técnico: ${estado}`,
    );
  }

  async cerrarConArchivos(
    id: number,
    tecnicoId: number,
    comentario: string,
    urlDespues: string,
    repuestos: RepuestoConsumoItemDto[] = [],
  ) {
    const ordenPrev = await this.findOne(id);

    if (
      ordenPrev.asignadoAId != null &&
      !this.esTecnicoAsignado(ordenPrev.asignadoAId, tecnicoId)
    ) {
      throw new BadRequestException(
        'Solo el técnico asignado puede cerrar esta orden',
      );
    }

    if (ordenPrev.estado !== EstadoOrdenTrabajo.EN_PROCESO) {
      throw new BadRequestException(
        'Solo se pueden cerrar órdenes en estado en_proceso',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const costoMateriales =
        await this.inventarioService.procesarConsumoEnTransaccion(
          manager,
          id,
          ordenPrev.sucursalId,
          tecnicoId,
          ordenPrev.codigoOt,
          repuestos,
        );

      const comentarioEnt = manager.getRepository(ComentarioOt).create({
        ordenTrabajoId: id,
        autorId: tecnicoId,
        comentario,
      });
      await manager.getRepository(ComentarioOt).save(comentarioEnt);

      const evidencia = manager.getRepository(EvidenciaOt).create({
        ordenTrabajoId: id,
        cargadoPorId: tecnicoId,
        tipoEvidencia: TipoEvidencia.DESPUES,
        urlImagen: urlDespues,
      });
      await manager.getRepository(EvidenciaOt).save(evidencia);

      await manager.getRepository(OrdenTrabajo).update(id, {
        estado: EstadoOrdenTrabajo.FINALIZADA,
        fechaFinReal: new Date(),
        costoMateriales: String(costoMateriales),
        motivoRechazo: null,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.findOne(id);
  }

  private esTecnicoAsignado(
    asignadoAId: number | null | undefined,
    tecnicoId: number,
  ): boolean {
    return (
      asignadoAId != null && Number(asignadoAId) === Number(tecnicoId)
    );
  }

  async iniciarConEvidencia(
    id: number,
    tecnicoId: number,
    urlFotoAntes: string,
  ) {
    const orden = await this.findOne(id);
    if (
      orden.asignadoAId != null &&
      !this.esTecnicoAsignado(orden.asignadoAId, tecnicoId)
    ) {
      // #region agent log
      agentDebugLog({ runId: 'post-fix', hypothesisId: 'D', location: 'ordenes-trabajo.service.ts:iniciarConEvidencia', message: 'rejected wrong tecnico', data: { id, asignadoAId: orden.asignadoAId, tecnicoId } });
      // #endregion
      throw new BadRequestException(
        'Solo el técnico asignado puede iniciar esta orden',
      );
    }
    if (
      orden.estado !== EstadoOrdenTrabajo.ASIGNADA &&
      orden.estado !== EstadoOrdenTrabajo.PENDIENTE
    ) {
      // #region agent log
      agentDebugLog({ runId: 'post-fix', hypothesisId: 'D', location: 'ordenes-trabajo.service.ts:iniciarConEvidencia', message: 'rejected bad estado', data: { id, estado: orden.estado, tecnicoId } });
      // #endregion
      throw new BadRequestException(
        'Solo se pueden iniciar órdenes pendientes o asignadas',
      );
    }

    if (orden.asignadoAId == null) {
      orden.asignadoAId = tecnicoId;
    }

    const evidenciaAntes = await this.evidenciaRepo().findOne({
      where: {
        ordenTrabajoId: id,
        tipoEvidencia: TipoEvidencia.ANTES,
      },
    });
    if (!evidenciaAntes) {
      await this.agregarEvidencia(id, tecnicoId, {
        tipoEvidencia: TipoEvidencia.ANTES,
        urlImagen: urlFotoAntes,
      });
    }

    const manager = this.manager();
    await manager.update(OrdenTrabajo, id, {
      estado: EstadoOrdenTrabajo.EN_PROCESO,
      fechaInicioReal: new Date(),
      asignadoAId: orden.asignadoAId,
    });

    const refreshed = await this.findOne(id);
    await this.syncActivoAlIniciarTrabajo(manager, refreshed);
    // #region agent log
    agentDebugLog({ runId: 'post-fix', hypothesisId: 'B,C', location: 'ordenes-trabajo.service.ts:iniciarConEvidencia', message: 'after update', data: { id, estado: refreshed.estado, fechaInicioReal: refreshed.fechaInicioReal, asignadoAId: refreshed.asignadoAId } });
    // #endregion
    return refreshed;
  }

  async iniciar(id: number, tecnicoId: number) {
    throw new BadRequestException(
      'Use PATCH /ordenes-trabajo/:id/estado con foto_antes para iniciar',
    );
  }

  async agregarComentario(
    ordenId: number,
    autorId: number,
    dto: CreateComentarioDto,
  ) {
    await this.findOne(ordenId);
    const comentario = this.comentarioRepo().create({
      ordenTrabajoId: ordenId,
      autorId,
      comentario: dto.comentario,
    });
    return this.comentarioRepo().save(comentario);
  }

  async agregarEvidencia(
    ordenId: number,
    cargadoPorId: number,
    dto: CreateEvidenciaDto,
  ) {
    await this.findOne(ordenId);
    const evidencia = this.evidenciaRepo().create({
      ordenTrabajoId: ordenId,
      tipoEvidencia: dto.tipoEvidencia,
      urlImagen: dto.urlImagen,
      cargadoPorId,
    });
    return this.evidenciaRepo().save(evidencia);
  }

  async cerrar(id: number, tecnicoId: number, dto: CerrarOrdenDto) {
    const orden = await this.findOne(id);

    if (!this.esTecnicoAsignado(orden.asignadoAId, tecnicoId)) {
      throw new BadRequestException(
        'Solo el técnico asignado puede cerrar esta orden',
      );
    }

    const tiposEnviados = new Set(dto.evidencias.map((e) => e.tipoEvidencia));
    if (
      !tiposEnviados.has(TipoEvidencia.ANTES) ||
      !tiposEnviados.has(TipoEvidencia.DESPUES)
    ) {
      throw new BadRequestException(
        'Debe incluir al menos una evidencia "antes" y una "despues"',
      );
    }

    for (const evidenciaDto of dto.evidencias) {
      await this.agregarEvidencia(id, tecnicoId, evidenciaDto);
    }

    orden.estado = EstadoOrdenTrabajo.FINALIZADA;
    orden.fechaFinReal = new Date();
    return this.ordenRepo().save(orden);
  }

  async aprobar(id: number) {
    const orden = await this.findOne(id);
    if (orden.estado !== EstadoOrdenTrabajo.FINALIZADA) {
      throw new BadRequestException(
        'Solo se pueden aprobar órdenes en estado finalizada',
      );
    }

    const manager = this.manager();
    orden.estado = EstadoOrdenTrabajo.APROBADA;
    orden.motivoRechazo = null;
    orden.fechaAprobacion = new Date();
    await manager.save(OrdenTrabajo, orden);
    await this.syncActivoTrasCierreOt(manager, orden);
    await this.actualizarServiciosOt(manager, orden);
    return this.findOne(id);
  }

  private static readonly REVERTIR_APROBACION_MS = 2 * 60 * 1000;

  async revertirAprobacion(id: number) {
    const orden = await this.findOne(id);
    if (orden.estado !== EstadoOrdenTrabajo.APROBADA) {
      throw new BadRequestException(
        'Solo se puede revertir una orden aprobada en el archivo histórico',
      );
    }
    if (!orden.fechaAprobacion) {
      throw new BadRequestException(
        'No se puede revertir: falta fecha de aprobación',
      );
    }
    const elapsed =
      Date.now() - new Date(orden.fechaAprobacion).getTime();
    if (elapsed > OrdenesTrabajoService.REVERTIR_APROBACION_MS) {
      throw new BadRequestException(
        'El plazo de 2 minutos para revertir la aprobación ha expirado',
      );
    }

    const manager = this.manager();
    orden.estado = EstadoOrdenTrabajo.FINALIZADA;
    orden.fechaAprobacion = null;
    await manager.save(OrdenTrabajo, orden);
    if (orden.activoId != null && orden.tipoMantenimiento === TipoMantenimiento.CORRECTIVO) {
      await this.actualizarEstadoActivo(
        manager,
        orden.activoId,
        EstadoOperacionalActivo.EN_REPARACION,
      );
    }
    return this.findOne(id);
  }

  async rechazar(
    id: number,
    motivo: string,
    _actualizarServiciosOperativo = false,
  ) {
    const orden = await this.findOne(id);
    const motivoRechazo = motivo.trim();
    if (motivoRechazo.length < 3) {
      throw new BadRequestException(
        'El motivo de rechazo debe tener al menos 3 caracteres',
      );
    }

    const manager = this.manager();

    if (orden.estado === EstadoOrdenTrabajo.FINALIZADA) {
      await this.eliminarEvidenciasDespues(manager, id);
      orden.estado = EstadoOrdenTrabajo.EN_PROCESO;
      orden.fechaFinReal = null;
      orden.motivoRechazo = motivoRechazo;
      await manager.save(OrdenTrabajo, orden);
      await this.syncActivoTrasCierreOt(manager, orden);
      return this.findOne(id);
    }

    if (orden.estado === EstadoOrdenTrabajo.PENDIENTE) {
      orden.estado = EstadoOrdenTrabajo.RECHAZADA;
      orden.motivoRechazo = motivoRechazo;
      orden.asignadoAId = null;
      await manager.save(OrdenTrabajo, orden);
      await this.syncActivoTrasCierreOt(manager, orden);
      await this.actualizarServiciosOt(manager, orden);
      return this.findOne(id);
    }

    throw new BadRequestException(
      'Solo se pueden rechazar tickets en estado pendiente o cierres en estado finalizada',
    );
  }

  private async actualizarServiciosOt(
    manager: EntityManager,
    orden: OrdenTrabajo,
  ): Promise<void> {
    const servicios = this.inferServiciosAfectadosOrden(orden);
    if (!servicios.length) return;
    const estadosObjetivo = await this.resolverEstadoServiciosTrasCierreOt(
      manager,
      orden,
      servicios,
    );
    const repo = manager.getRepository(FacilidadCritica);
    const historialRepo = manager.getRepository(FacilidadCriticaHistorial);
    const facilidades = await repo.find({
      where: { sucursalId: orden.sucursalId },
    });
    for (const f of facilidades) {
      if (!servicios.includes(f.tipo)) continue;
      const estadoDestino = estadosObjetivo.get(f.tipo);
      if (!estadoDestino || estadoDestino === f.estado) continue;
      const estadoAnterior = f.estado;
      f.estado = estadoDestino;
      await repo.save(f);
      await historialRepo.save({
        facilidadCriticaId: f.id,
        estadoAnterior,
        estadoNuevo: estadoDestino,
        descripcionProblema: `Sincronizado por OT ${orden.codigoOt} (${orden.estado})`,
        reportadoPorId: orden.creadoPorId,
      });
    }
  }

  private async resolverEstadoServiciosTrasCierreOt(
    manager: EntityManager,
    orden: OrdenTrabajo,
    serviciosObjetivo: string[],
  ): Promise<Map<string, EstadoFacilidadCritica>> {
    const estados = new Map<string, EstadoFacilidadCritica>(
      serviciosObjetivo.map((servicio) => [
        servicio,
        EstadoFacilidadCritica.OPERATIVO,
      ]),
    );
    const otsAbiertas = await manager.getRepository(OrdenTrabajo).find({
      where: {
        sucursalId: orden.sucursalId,
        clasificacion: ClasificacionOrden.INFRAESTRUCTURA,
        estado: In(OrdenesTrabajoService.ESTADOS_OT_BLOQUEAN_OPERATIVO),
      },
      select: {
        id: true,
        clasificacion: true,
        estado: true,
        serviciosAfectados: true,
        fallaGeneralServicios: true,
        areaServicios: true,
        generoServicios: true,
      },
    });

    for (const otAbierta of otsAbiertas) {
      if (otAbierta.id === orden.id) continue;
      const serviciosOt = this.inferServiciosAfectadosOrden(otAbierta);
      for (const servicio of serviciosOt) {
        if (!estados.has(servicio)) continue;
        estados.set(servicio, EstadoFacilidadCritica.FUERA_DE_SERVICIO);
      }
    }

    return estados;
  }

  private inferServiciosAfectadosOrden(orden: OrdenTrabajo): string[] {
    const explicitos = (orden.serviciosAfectados ?? []).filter(Boolean);
    if (explicitos.length) return explicitos;
    if (orden.fallaGeneralServicios) {
      return [
        TipoFacilidadCritica.BANO_HOMBRES,
        TipoFacilidadCritica.BANO_MUJERES,
        TipoFacilidadCritica.CAMARIN_HOMBRES,
        TipoFacilidadCritica.CAMARIN_MUJERES,
        TipoFacilidadCritica.DUCHAS_HOMBRES,
        TipoFacilidadCritica.DUCHAS_MUJERES,
      ];
    }
    if (orden.areaServicios && orden.generoServicios) {
      return [resolveTipoFacilidad(orden.areaServicios, orden.generoServicios)];
    }
    return [];
  }
}
