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
exports.SucursalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const sucursal_entity_1 = require("../entities/sucursal.entity");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
let SucursalesService = class SucursalesService {
    dataSource;
    transactionContext;
    constructor(dataSource, transactionContext) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
    }
    repo() {
        return this.transactionContext.getRepository(sucursal_entity_1.Sucursal, this.dataSource);
    }
    findAll() {
        return this.repo().find({ order: { nombre: 'ASC' } });
    }
    async findOne(id) {
        const sucursal = await this.repo().findOne({ where: { id } });
        if (!sucursal) {
            throw new common_1.NotFoundException(`Sucursal ${id} no encontrada`);
        }
        return sucursal;
    }
    create(dto) {
        const sucursal = this.repo().create({
            nombre: dto.nombre,
            direccion: dto.direccion ?? null,
            comuna: dto.comuna ?? null,
            ciudad: dto.ciudad ?? null,
            estaActiva: dto.estaActiva ?? true,
        });
        return this.repo().save(sucursal);
    }
    async update(id, dto) {
        const sucursal = await this.findOne(id);
        Object.assign(sucursal, dto);
        return this.repo().save(sucursal);
    }
    async remove(id) {
        const sucursal = await this.findOne(id);
        await this.repo().remove(sucursal);
        return { deleted: true };
    }
};
exports.SucursalesService = SucursalesService;
exports.SucursalesService = SucursalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService])
], SucursalesService);
//# sourceMappingURL=sucursales.service.js.map