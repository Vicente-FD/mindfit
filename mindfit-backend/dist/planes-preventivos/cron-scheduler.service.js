"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CronSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const plan_preventivo_entity_1 = require("../entities/plan-preventivo.entity");
const usuario_entity_1 = require("../entities/usuario.entity");
const ordenes_trabajo_service_1 = require("../ordenes-trabajo/ordenes-trabajo.service");
let CronSchedulerService = CronSchedulerService_1 = class CronSchedulerService {
    dataSource;
    ordenesService;
    logger = new common_1.Logger(CronSchedulerService_1.name);
    constructor(dataSource, ordenesService) {
        this.dataSource = dataSource;
        this.ordenesService = ordenesService;
    }
    async generarOrdenesPreventivas() {
        const hoy = this.fechaHoyIso();
        this.logger.log(`Cron preventivo: evaluando planes para ${hoy}`);
        const planes = await this.dataSource
            .getRepository(plan_preventivo_entity_1.PlanPreventivo)
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
                await this.ordenesService.create({
                    clasificacion: enums_1.ClasificacionOrden.MAQUINA,
                    activoId: plan.activoId,
                    sucursalId: plan.equipo.sucursalId,
                    titulo: plan.titulo,
                    descripcion: plan.descripcion ??
                        `Mantenimiento preventivo programado (cada ${plan.intervaloDias} días)`,
                    prioridad: enums_1.PrioridadOrden.MEDIA,
                    tipoMantenimiento: enums_1.TipoMantenimiento.PREVENTIVO,
                }, creadoPorId);
                const siguiente = this.sumarDias(plan.proximaFechaEjecucion, plan.intervaloDias);
                await this.dataSource.getRepository(plan_preventivo_entity_1.PlanPreventivo).update(plan.id, {
                    proximaFechaEjecucion: siguiente,
                });
                generadas++;
                this.logger.log(`OT preventiva creada desde plan ${plan.id} — próxima: ${siguiente}`);
            }
            catch (err) {
                this.logger.error(`Error en plan preventivo ${plan.id}: ${err.message}`);
            }
        }
        this.logger.log(`Cron preventivo finalizado: ${generadas} OT(s) generadas`);
    }
    fechaHoyIso() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    sumarDias(fechaIso, dias) {
        const d = new Date(`${fechaIso}T12:00:00`);
        d.setDate(d.getDate() + dias);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    async resolverUsuarioSistema() {
        const admin = await this.dataSource.getRepository(usuario_entity_1.Usuario).findOne({
            where: { rol: enums_1.RolUsuario.ADMIN, estaActivo: true },
            order: { id: 'ASC' },
        });
        if (admin)
            return admin.id;
        const jefe = await this.dataSource.getRepository(usuario_entity_1.Usuario).findOne({
            where: { rol: enums_1.RolUsuario.JEFE_OPERACIONES, estaActivo: true },
            order: { id: 'ASC' },
        });
        if (jefe)
            return jefe.id;
        throw new Error('No hay usuario admin/jefe para atribuir OTs preventivas automáticas');
    }
};
exports.CronSchedulerService = CronSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronSchedulerService.prototype, "generarOrdenesPreventivas", null);
exports.CronSchedulerService = CronSchedulerService = CronSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        ordenes_trabajo_service_1.OrdenesTrabajoService])
], CronSchedulerService);
//# sourceMappingURL=cron-scheduler.service.js.map