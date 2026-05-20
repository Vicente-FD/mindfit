import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  EstadoOrdenTrabajo,
  PrioridadOrden,
  TipoEvidencia,
} from '../common/enums';
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

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
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
    const year = new Date().getFullYear();
    const count = await this.ordenRepo().count();
    return `OT-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  findAll(filters?: { tecnicoId?: number; sucursalId?: number }) {
    const qb = this.ordenRepo()
      .createQueryBuilder('ot')
      .leftJoinAndSelect('ot.activo', 'activo')
      .leftJoinAndSelect('ot.sucursal', 'sucursal')
      .leftJoinAndSelect('ot.creadoPor', 'creadoPor')
      .leftJoinAndSelect('ot.asignadoA', 'asignadoA')
      .orderBy('ot.createdAt', 'DESC');

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

    return qb.getMany();
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

  async create(dto: CreateOrdenTrabajoDto, creadoPorId: number) {
    const orden = this.ordenRepo().create({
      codigoOt: await this.generarCodigoOt(),
      activoId: dto.activoId ?? null,
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
    return this.ordenRepo().save(orden);
  }

  async update(id: number, dto: UpdateOrdenTrabajoDto) {
    const orden = await this.findOne(id);
    Object.assign(orden, {
      ...dto,
      fechaProgramacion: dto.fechaProgramacion
        ? new Date(dto.fechaProgramacion)
        : orden.fechaProgramacion,
    });
    return this.ordenRepo().save(orden);
  }

  async asignar(id: number, dto: AsignarOrdenDto) {
    const orden = await this.findOne(id);
    orden.asignadoAId = dto.asignadoAId;
    orden.estado = EstadoOrdenTrabajo.ASIGNADA;
    return this.ordenRepo().save(orden);
  }

  async iniciar(id: number, tecnicoId: number) {
    const orden = await this.findOne(id);
    if (orden.asignadoAId !== tecnicoId) {
      throw new BadRequestException(
        'Solo el técnico asignado puede iniciar esta orden',
      );
    }
    orden.estado = EstadoOrdenTrabajo.EN_PROCESO;
    orden.fechaInicioReal = new Date();
    return this.ordenRepo().save(orden);
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

    if (orden.asignadoAId !== tecnicoId) {
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

    const evidencias = await this.evidenciaRepo().find({
      where: { ordenTrabajoId: id },
    });
    const tipos = new Set(evidencias.map((e) => e.tipoEvidencia));
    if (
      !tipos.has(TipoEvidencia.ANTES) ||
      !tipos.has(TipoEvidencia.DESPUES)
    ) {
      throw new BadRequestException(
        'La orden debe tener evidencias antes y después para ser aprobada',
      );
    }

    orden.estado = EstadoOrdenTrabajo.APROBADA;
    return this.ordenRepo().save(orden);
  }
}
