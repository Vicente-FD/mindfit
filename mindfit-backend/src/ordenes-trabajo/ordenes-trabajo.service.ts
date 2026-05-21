import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ClasificacionOrden,
  EstadoOrdenTrabajo,
  PrioridadOrden,
  RolUsuario,
  TipoEvidencia,
  TipoMantenimiento,
} from '../common/enums';
import { Usuario } from '../entities/usuario.entity';
import { Activo } from '../entities/activo.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { EvidenciaOt } from '../entities/evidencia-ot.entity';
import { ComentarioOt } from '../entities/comentario-ot.entity';
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
      activoId: number;
      descripcion: string;
      prioridad: PrioridadOrden;
      titulo?: string;
    },
    creadoPorId: number,
    sucursalId: number,
    fotoUrl?: string,
  ) {
    const orden = await this.create(
      {
        activoId: dto.activoId,
        sucursalId,
        titulo: dto.titulo ?? `Reporte de falla - Activo #${dto.activoId}`,
        descripcion: dto.descripcion,
        prioridad: dto.prioridad,
        tipoMantenimiento: TipoMantenimiento.CORRECTIVO,
      },
      creadoPorId,
    );

    if (fotoUrl) {
      await this.agregarEvidencia(orden.id, creadoPorId, {
        tipoEvidencia: TipoEvidencia.ANTES,
        urlImagen: fotoUrl,
      });
    }

    return this.findOne(orden.id);
  }

  async create(dto: CreateOrdenTrabajoDto, creadoPorId: number) {
    const clasificacion = dto.clasificacion ?? ClasificacionOrden.MAQUINA;
    const manager = this.transactionContext.getManager(this.dataSource);

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

    const orden = this.ordenRepo().create({
      codigoOt: await this.generarCodigoOt(),
      clasificacion,
      activoId:
        clasificacion === ClasificacionOrden.INFRAESTRUCTURA
          ? null
          : (dto.activoId ?? null),
      sucursalId: dto.sucursalId,
      creadoPorId,
      titulo: dto.titulo,
      descripcion: dto.descripcion ?? null,
      prioridad: dto.prioridad ?? PrioridadOrden.MEDIA,
      tipoMantenimiento: dto.tipoMantenimiento,
      estado: EstadoOrdenTrabajo.PENDIENTE,
      tiempoEstimadoMinutos: dto.tiempoEstimadoMinutos ?? null,
      fechaProgramacion: dto.fechaProgramacion
        ? new Date(dto.fechaProgramacion)
        : null,
    });
    const saved = await this.ordenRepo().save(orden);
    return this.findOne(saved.id);
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

    await this.ordenRepo().update(id, {
      estado: EstadoOrdenTrabajo.EN_PROCESO,
      fechaInicioReal: new Date(),
      asignadoAId: orden.asignadoAId,
    });

    const refreshed = await this.findOne(id);
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

    orden.estado = EstadoOrdenTrabajo.APROBADA;
    orden.motivoRechazo = null;
    orden.fechaAprobacion = new Date();
    await this.ordenRepo().save(orden);
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

    orden.estado = EstadoOrdenTrabajo.FINALIZADA;
    orden.fechaAprobacion = null;
    await this.ordenRepo().save(orden);
    return this.findOne(id);
  }

  async rechazar(id: number, motivo: string) {
    const orden = await this.findOne(id);
    const motivoRechazo = motivo.trim();
    if (motivoRechazo.length < 3) {
      throw new BadRequestException(
        'El motivo de rechazo debe tener al menos 3 caracteres',
      );
    }

    if (orden.estado === EstadoOrdenTrabajo.FINALIZADA) {
      orden.estado = EstadoOrdenTrabajo.EN_PROCESO;
      orden.fechaFinReal = null;
      orden.motivoRechazo = motivoRechazo;
      await this.ordenRepo().save(orden);
      return this.findOne(id);
    }

    if (orden.estado === EstadoOrdenTrabajo.PENDIENTE) {
      orden.estado = EstadoOrdenTrabajo.RECHAZADA;
      orden.motivoRechazo = motivoRechazo;
      orden.asignadoAId = null;
      await this.ordenRepo().save(orden);
      return this.findOne(id);
    }

    throw new BadRequestException(
      'Solo se pueden rechazar tickets en estado pendiente o cierres en estado finalizada',
    );
  }
}
