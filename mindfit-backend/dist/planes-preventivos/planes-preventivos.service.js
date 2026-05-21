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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanesPreventivosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const plan_preventivo_entity_1 = require("../entities/plan-preventivo.entity");
const activo_entity_1 = require("../entities/activo.entity");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
let PlanesPreventivosService = class PlanesPreventivosService {
    dataSource;
    transactionContext;
    constructor(dataSource, transactionContext) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
    }
    repo() {
        return this.transactionContext.getRepository(plan_preventivo_entity_1.PlanPreventivo, this.dataSource);
    }
    findAll() {
        return this.repo()
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.equipo', 'equipo')
            .leftJoinAndSelect('equipo.sucursal', 'sucursal')
            .orderBy('p.proximaFechaEjecucion', 'ASC')
            .getMany();
    }
    async findOne(id) {
        const plan = await this.repo().findOne({
            where: { id },
            relations: { equipo: { sucursal: true } },
        });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan preventivo ${id} no encontrado`);
        }
        return plan;
    }
    async create(dto) {
        await this.assertActivoVigente(dto.activoId);
        const plan = this.repo().create({
            titulo: dto.titulo,
            descripcion: dto.descripcion ?? null,
            activoId: dto.activoId,
            intervaloDias: dto.intervaloDias,
            proximaFechaEjecucion: dto.proximaFechaEjecucion,
            planActivo: dto.activo ?? true,
        });
        return this.repo().save(plan);
    }
    async update(id, dto) {
        const plan = await this.findOne(id);
        if (dto.activoId != null) {
            await this.assertActivoVigente(dto.activoId);
            plan.activoId = dto.activoId;
        }
        if (dto.titulo != null)
            plan.titulo = dto.titulo;
        if (dto.descripcion !== undefined)
            plan.descripcion = dto.descripcion || null;
        if (dto.intervaloDias != null)
            plan.intervaloDias = dto.intervaloDias;
        if (dto.proximaFechaEjecucion != null) {
            plan.proximaFechaEjecucion = dto.proximaFechaEjecucion;
        }
        if (dto.activo != null)
            plan.planActivo = dto.activo;
        return this.repo().save(plan);
    }
    async remove(id) {
        const plan = await this.findOne(id);
        plan.planActivo = false;
        await this.repo().save(plan);
        return { deactivated: true };
    }
    async assertActivoVigente(activoId) {
        const count = await this.dataSource
            .getRepository(activo_entity_1.Activo)
            .createQueryBuilder('a')
            .where('a.id = :id', { id: activoId })
            .andWhere('a.deleted_at IS NULL')
            .getCount();
        if (!count) {
            throw new common_1.BadRequestException('Activo no encontrado o dado de baja');
        }
    }
};
exports.PlanesPreventivosService = PlanesPreventivosService;
exports.PlanesPreventivosService = PlanesPreventivosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService])
], PlanesPreventivosService);
//# sourceMappingURL=planes-preventivos.service.js.map