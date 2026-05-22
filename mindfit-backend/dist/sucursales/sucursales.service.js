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
const activo_entity_1 = require("../entities/activo.entity");
const sucursal_entity_1 = require("../entities/sucursal.entity");
const enums_1 = require("../common/enums");
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
    async findAll() {
        const rows = await this.repo()
            .createQueryBuilder('s')
            .where('s.deleted_at IS NULL')
            .orderBy('s.nombre', 'ASC')
            .getMany();
        const counts = await this.dataSource
            .getRepository(activo_entity_1.Activo)
            .createQueryBuilder('a')
            .select('a.sucursal_id', 'sucursalId')
            .addSelect('COUNT(*)::int', 'total')
            .where('a.deleted_at IS NULL')
            .andWhere('a.estado_operacional = :estado', {
            estado: enums_1.EstadoOperacionalActivo.OPERATIVO,
        })
            .groupBy('a.sucursal_id')
            .getRawMany();
        const countMap = new Map(counts.map((c) => [Number(c.sucursalId), Number(c.total)]));
        return rows.map((s) => ({
            id: s.id,
            nombre: s.nombre,
            sigla: s.sigla,
            direccion: s.direccion,
            comuna: s.comuna,
            ciudad: s.ciudad,
            estaActiva: s.estaActiva,
            cantidadPisos: s.cantidadPisos ?? 1,
            activosOperativos: countMap.get(s.id) ?? 0,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }));
    }
    async findOne(id) {
        const sucursal = await this.repo()
            .createQueryBuilder('s')
            .where('s.id = :id', { id })
            .andWhere('s.deleted_at IS NULL')
            .getOne();
        if (!sucursal) {
            throw new common_1.NotFoundException(`Sucursal ${id} no encontrada`);
        }
        return sucursal;
    }
    normalizeSigla(sigla) {
        return sigla.trim().toUpperCase();
    }
    async assertSiglaUnique(sigla, excludeId) {
        const qb = this.repo()
            .createQueryBuilder('s')
            .where('s.sigla = :sigla', { sigla })
            .andWhere('s.deleted_at IS NULL');
        if (excludeId != null) {
            qb.andWhere('s.id != :excludeId', { excludeId });
        }
        const exists = await qb.getOne();
        if (exists) {
            throw new common_1.ConflictException(`La sigla «${sigla}» ya está asignada a otra sucursal activa`);
        }
    }
    async create(dto) {
        const sigla = this.normalizeSigla(dto.sigla);
        await this.assertSiglaUnique(sigla);
        const sucursal = this.repo().create({
            nombre: dto.nombre.trim(),
            sigla,
            direccion: dto.direccion.trim(),
            comuna: dto.comuna.trim(),
            ciudad: dto.ciudad.trim(),
            estaActiva: dto.estaActiva ?? true,
            cantidadPisos: dto.cantidadPisos ?? 1,
        });
        try {
            return await this.repo().save(sucursal);
        }
        catch (err) {
            this.handleUniqueViolation(err);
            throw err;
        }
    }
    async update(id, dto) {
        const sucursal = await this.findOne(id);
        if (dto.nombre != null)
            sucursal.nombre = dto.nombre.trim();
        if (dto.direccion != null)
            sucursal.direccion = dto.direccion.trim();
        if (dto.comuna != null)
            sucursal.comuna = dto.comuna.trim();
        if (dto.ciudad != null)
            sucursal.ciudad = dto.ciudad.trim();
        if (dto.estaActiva != null)
            sucursal.estaActiva = dto.estaActiva;
        if (dto.cantidadPisos != null)
            sucursal.cantidadPisos = dto.cantidadPisos;
        if (dto.sigla != null) {
            const sigla = this.normalizeSigla(dto.sigla);
            await this.assertSiglaUnique(sigla, id);
            sucursal.sigla = sigla;
        }
        try {
            return await this.repo().save(sucursal);
        }
        catch (err) {
            this.handleUniqueViolation(err);
            throw err;
        }
    }
    async remove(id) {
        await this.findOne(id);
        const activoRepo = this.transactionContext.getRepository(activo_entity_1.Activo, this.dataSource);
        await activoRepo.softDelete({ sucursalId: id });
        await this.repo().update(id, { estaActiva: false });
        await this.repo().softDelete(id);
        return { deleted: true };
    }
    handleUniqueViolation(err) {
        const code = err?.code;
        if (code === '23505') {
            throw new common_1.ConflictException('Nombre o sigla de sucursal ya existe en el sistema');
        }
    }
};
exports.SucursalesService = SucursalesService;
exports.SucursalesService = SucursalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService])
], SucursalesService);
//# sourceMappingURL=sucursales.service.js.map