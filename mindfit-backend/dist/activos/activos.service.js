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
exports.ActivosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const activo_entity_1 = require("../entities/activo.entity");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
let ActivosService = class ActivosService {
    dataSource;
    transactionContext;
    constructor(dataSource, transactionContext) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
    }
    repo() {
        return this.transactionContext.getRepository(activo_entity_1.Activo, this.dataSource);
    }
    findAll(sucursalId) {
        return this.repo().find({
            where: sucursalId ? { sucursalId } : {},
            relations: { sucursal: true },
            order: { nombre: 'ASC' },
        });
    }
    async findOne(id) {
        const activo = await this.repo().findOne({
            where: { id },
            relations: { sucursal: true },
        });
        if (!activo) {
            throw new common_1.NotFoundException(`Activo ${id} no encontrado`);
        }
        return activo;
    }
    async findByUuid(uuidActivo) {
        const activo = await this.repo().findOne({
            where: { uuidActivo },
            relations: { sucursal: true },
        });
        if (!activo) {
            throw new common_1.NotFoundException(`Activo con UUID ${uuidActivo} no encontrado`);
        }
        return activo;
    }
    async create(dto) {
        if (dto.numeroSerie) {
            const exists = await this.repo().findOne({
                where: { numeroSerie: dto.numeroSerie },
            });
            if (exists) {
                throw new common_1.ConflictException('Número de serie ya registrado');
            }
        }
        const activo = this.repo().create({
            nombre: dto.nombre,
            marca: dto.marca ?? null,
            modelo: dto.modelo ?? null,
            numeroSerie: dto.numeroSerie ?? null,
            categoria: dto.categoria,
            sucursalId: dto.sucursalId,
            fechaCompra: dto.fechaCompra ?? null,
            fechaVencimientoGarantia: dto.fechaVencimientoGarantia ?? null,
            costoAdquisicion: dto.costoAdquisicion != null ? String(dto.costoAdquisicion) : null,
            documentacionUrls: dto.documentacionUrls ?? [],
            estadoOperacional: dto.estadoOperacional,
        });
        return this.repo().save(activo);
    }
    async update(id, dto) {
        const activo = await this.findOne(id);
        if (dto.numeroSerie && dto.numeroSerie !== activo.numeroSerie) {
            const exists = await this.repo().findOne({
                where: { numeroSerie: dto.numeroSerie },
            });
            if (exists) {
                throw new common_1.ConflictException('Número de serie ya registrado');
            }
        }
        Object.assign(activo, {
            ...dto,
            costoAdquisicion: dto.costoAdquisicion != null
                ? String(dto.costoAdquisicion)
                : activo.costoAdquisicion,
        });
        return this.repo().save(activo);
    }
};
exports.ActivosService = ActivosService;
exports.ActivosService = ActivosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService])
], ActivosService);
//# sourceMappingURL=activos.service.js.map