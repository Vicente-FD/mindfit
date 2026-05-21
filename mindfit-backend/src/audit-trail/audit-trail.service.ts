import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperacionAuditoria } from '../common/enums';
import { AuditTrail } from '../entities/audit-trail.entity';
import { FilterAuditTrailDto } from './dto/filter-audit-trail.dto';

export interface AuditTrailItemDto {
  id: string;
  timeStamp: string;
  tableName: string;
  rowPk: string;
  operation: OperacionAuditoria;
  userId: number | null;
  usuarioNombre: string | null;
  mensaje: string;
}

const ESTADO_OT_LABEL: Record<string, string> = {
  pendiente: 'pendiente',
  asignada: 'asignada',
  en_proceso: 'en proceso',
  finalizada: 'finalizada',
  aprobada: 'aprobada',
};

const TABLA_LABEL: Record<string, string> = {
  ordenes_trabajo: 'Orden de trabajo',
  activos: 'Activo',
};

@Injectable()
export class AuditTrailService {
  constructor(
    @InjectRepository(AuditTrail)
    private readonly repo: Repository<AuditTrail>,
  ) {}

  async findAll(filters: FilterAuditTrailDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 30;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.usuario', 'usuario')
      .orderBy('a.timeStamp', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.tableName?.trim()) {
      qb.andWhere('a.table_name = :tableName', {
        tableName: filters.tableName.trim(),
      });
    }

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map((row) => this.toDto(row)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private toDto(row: AuditTrail): AuditTrailItemDto {
    return {
      id: row.id,
      timeStamp: row.timeStamp.toISOString(),
      tableName: row.tableName,
      rowPk: row.rowPk,
      operation: row.operation,
      userId: row.userId,
      usuarioNombre: row.usuario?.nombre ?? null,
      mensaje: this.formatMensaje(row),
    };
  }

  private formatMensaje(row: AuditTrail): string {
    const quien = row.usuario?.nombre ?? 'Sistema';
    const tabla = TABLA_LABEL[row.tableName] ?? row.tableName;

    if (row.tableName === 'ordenes_trabajo') {
      return this.formatOrdenTrabajo(row, quien, tabla);
    }
    if (row.tableName === 'activos') {
      return this.formatActivo(row, quien, tabla);
    }

    return `${quien} realizó ${row.operation} en ${tabla} (registro ${row.rowPk})`;
  }

  private formatOrdenTrabajo(
    row: AuditTrail,
    quien: string,
    tabla: string,
  ): string {
    const codigo =
      (row.newData?.['codigo_ot'] as string) ??
      (row.oldData?.['codigo_ot'] as string) ??
      `#${row.rowPk}`;

    if (row.operation === OperacionAuditoria.INSERT) {
      const estado = ESTADO_OT_LABEL[String(row.newData?.['estado'])] ?? 'nueva';
      return `${quien} creó ${tabla} ${codigo} en estado «${estado}»`;
    }

    if (row.operation === OperacionAuditoria.DELETE) {
      return `${quien} eliminó ${tabla} ${codigo}`;
    }

    const oldEstado = row.oldData?.['estado'];
    const newEstado = row.newData?.['estado'];
    if (oldEstado != null && newEstado != null && oldEstado !== newEstado) {
      const de = ESTADO_OT_LABEL[String(oldEstado)] ?? String(oldEstado);
      const a = ESTADO_OT_LABEL[String(newEstado)] ?? String(newEstado);
      return `${quien} cambió el estado de ${codigo} de «${de}» a «${a}»`;
    }

    if (row.oldData?.['asignado_a_id'] !== row.newData?.['asignado_a_id']) {
      return `${quien} actualizó la asignación de ${codigo}`;
    }

    return `${quien} modificó ${tabla} ${codigo}`;
  }

  private formatActivo(row: AuditTrail, quien: string, tabla: string): string {
    const nombre =
      (row.newData?.['nombre'] as string) ??
      (row.oldData?.['nombre'] as string) ??
      `#${row.rowPk}`;

    if (row.operation === OperacionAuditoria.INSERT) {
      return `${quien} registró ${tabla} «${nombre}»`;
    }
    if (row.operation === OperacionAuditoria.DELETE) {
      return `${quien} dio de baja ${tabla} «${nombre}»`;
    }

    const oldEst = row.oldData?.['estado_operacional'];
    const newEst = row.newData?.['estado_operacional'];
    if (oldEst != null && newEst != null && oldEst !== newEst) {
      return `${quien} cambió el estado operacional de «${nombre}» de «${oldEst}» a «${newEst}»`;
    }

    return `${quien} modificó ${tabla} «${nombre}»`;
  }
}
