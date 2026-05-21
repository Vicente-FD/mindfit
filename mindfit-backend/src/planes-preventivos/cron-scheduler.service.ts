import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import {
  ClasificacionOrden,
  PrioridadOrden,
  RolUsuario,
  TipoMantenimiento,
} from '../common/enums';
import { PlanPreventivo } from '../entities/plan-preventivo.entity';
import { Usuario } from '../entities/usuario.entity';
import { OrdenesTrabajoService } from '../ordenes-trabajo/ordenes-trabajo.service';

@Injectable()
export class CronSchedulerService {
  private readonly logger = new Logger(CronSchedulerService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly ordenesService: OrdenesTrabajoService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generarOrdenesPreventivas(): Promise<void> {
    const hoy = this.fechaHoyIso();
    this.logger.log(`Cron preventivo: evaluando planes para ${hoy}`);

    const planes = await this.dataSource
      .getRepository(PlanPreventivo)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.equipo', 'equipo')
      .where('p.activo = :habilitado', { habilitado: true })
      .andWhere('p.proxima_fecha_ejecucion = :hoy', { hoy })
      .andWhere('equipo.deleted_at IS NULL')
      .getMany();

    if (!planes.length) {
      this.logger.log('Sin planes preventivos para ejecutar hoy');
      return;
    }

    const creadoPorId = await this.resolverUsuarioSistema();
    let generadas = 0;

    for (const plan of planes) {
      try {
        if (!plan.equipo?.sucursalId) {
          this.logger.warn(`Plan ${plan.id}: activo sin sucursal, omitido`);
          continue;
        }

        await this.ordenesService.create(
          {
            clasificacion: ClasificacionOrden.MAQUINA,
            activoId: plan.activoId,
            sucursalId: plan.equipo.sucursalId,
            titulo: plan.titulo,
            descripcion:
              plan.descripcion ??
              `Mantenimiento preventivo programado (cada ${plan.intervaloDias} días)`,
            prioridad: PrioridadOrden.MEDIA,
            tipoMantenimiento: TipoMantenimiento.PREVENTIVO,
          },
          creadoPorId,
        );

        const siguiente = this.sumarDias(
          plan.proximaFechaEjecucion,
          plan.intervaloDias,
        );
        await this.dataSource.getRepository(PlanPreventivo).update(plan.id, {
          proximaFechaEjecucion: siguiente,
        });

        generadas++;
        this.logger.log(
          `OT preventiva creada desde plan ${plan.id} — próxima: ${siguiente}`,
        );
      } catch (err) {
        this.logger.error(
          `Error en plan preventivo ${plan.id}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(`Cron preventivo finalizado: ${generadas} OT(s) generadas`);
  }

  private fechaHoyIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private sumarDias(fechaIso: string, dias: number): string {
    const d = new Date(`${fechaIso}T12:00:00`);
    d.setDate(d.getDate() + dias);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private async resolverUsuarioSistema(): Promise<number> {
    const admin = await this.dataSource.getRepository(Usuario).findOne({
      where: { rol: RolUsuario.ADMIN, estaActivo: true },
      order: { id: 'ASC' },
    });
    if (admin) return admin.id;

    const jefe = await this.dataSource.getRepository(Usuario).findOne({
      where: { rol: RolUsuario.JEFE_OPERACIONES, estaActivo: true },
      order: { id: 'ASC' },
    });
    if (jefe) return jefe.id;

    throw new Error(
      'No hay usuario admin/jefe para atribuir OTs preventivas automáticas',
    );
  }
}
