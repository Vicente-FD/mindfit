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
exports.OportunidadesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const oportunidad_entity_1 = require("../entities/oportunidad.entity");
const clientes_service_1 = require("../clientes/clientes.service");
let OportunidadesService = class OportunidadesService {
    dataSource;
    clientesService;
    constructor(dataSource, clientesService) {
        this.dataSource = dataSource;
        this.clientesService = clientesService;
    }
    repo() {
        return this.dataSource.getRepository(oportunidad_entity_1.Oportunidad);
    }
    findAll() {
        return this.repo().find({
            relations: { cliente: true, creadoPor: true },
            order: { updatedAt: 'DESC' },
        });
    }
    async findOne(id) {
        const o = await this.repo().findOne({
            where: { id },
            relations: { cliente: true, creadoPor: true },
        });
        if (!o)
            throw new common_1.NotFoundException(`Oportunidad ${id} no encontrada`);
        return o;
    }
    async create(dto, creadoPorId) {
        await this.clientesService.findOne(dto.clienteId);
        const opp = this.repo().create({
            clienteId: dto.clienteId,
            creadoPorId,
            titulo: dto.titulo.trim(),
            etapa: dto.etapa ?? enums_1.EtapaOportunidad.PROSPECCION,
            montoEstimado: String(dto.montoEstimado ?? 0),
            divisaCodigo: dto.divisaCodigo ?? 'CLP',
            notas: dto.notas?.trim() ?? null,
        });
        const saved = await this.repo().save(opp);
        return this.findOne(saved.id);
    }
    async update(id, dto) {
        const opp = await this.findOne(id);
        if (dto.titulo != null)
            opp.titulo = dto.titulo.trim();
        if (dto.etapa != null)
            opp.etapa = dto.etapa;
        if (dto.montoEstimado != null) {
            opp.montoEstimado = String(dto.montoEstimado);
        }
        if (dto.divisaCodigo != null)
            opp.divisaCodigo = dto.divisaCodigo;
        if (dto.notas !== undefined)
            opp.notas = dto.notas?.trim() ?? null;
        await this.repo().save(opp);
        return this.findOne(id);
    }
    async marcarGanada(id) {
        return this.update(id, { etapa: enums_1.EtapaOportunidad.GANADA });
    }
};
exports.OportunidadesService = OportunidadesService;
exports.OportunidadesService = OportunidadesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        clientes_service_1.ClientesService])
], OportunidadesService);
//# sourceMappingURL=oportunidades.service.js.map