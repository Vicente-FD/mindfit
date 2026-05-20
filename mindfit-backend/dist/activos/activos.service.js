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
const marca_entity_1 = require("../entities/marca.entity");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
const codigo_inventario_service_1 = require("./codigo-inventario.service");
let ActivosService = class ActivosService {
    dataSource;
    transactionContext;
    codigoInventario;
    constructor(dataSource, transactionContext, codigoInventario) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
        this.codigoInventario = codigoInventario;
    }
    repo() {
        return this.transactionContext.getRepository(activo_entity_1.Activo, this.dataSource);
    }
    findAll(filters = {}) {
        const qb = this.repo()
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.sucursal', 'sucursal')
            .leftJoinAndSelect('a.marcaRelacion', 'marca')
            .orderBy('a.nombre', 'ASC');
        if (filters.sucursalId != null) {
            qb.andWhere('a.sucursal_id = :sucursalId', {
                sucursalId: filters.sucursalId,
            });
        }
        if (filters.marcaId != null) {
            qb.andWhere('a.marca_id = :marcaId', { marcaId: filters.marcaId });
        }
        if (filters.categoria) {
            qb.andWhere('a.categoria = :categoria', { categoria: filters.categoria });
        }
        if (filters.anioCompra != null) {
            qb.andWhere('EXTRACT(YEAR FROM a.fecha_compra) = :anio', {
                anio: filters.anioCompra,
            });
        }
        if (filters.busqueda?.trim()) {
            const q = `%${filters.busqueda.trim().toLowerCase()}%`;
            qb.andWhere(`(LOWER(a.nombre) LIKE :q OR LOWER(a.codigo_inventario) LIKE :q OR LOWER(a.codigo_qr_token) LIKE :q)`, { q });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const activo = await this.repo().findOne({
            where: { id },
            relations: { sucursal: true, marcaRelacion: true },
        });
        if (!activo) {
            throw new common_1.NotFoundException(`Activo ${id} no encontrado`);
        }
        return activo;
    }
    async findByUuid(uuidActivo) {
        return this.findByPublicIdentifier(uuidActivo);
    }
    async findByPublicIdentifier(identifier) {
        let activo = await this.repo().findOne({
            where: { uuidActivo: identifier },
            relations: { sucursal: true, marcaRelacion: true },
        });
        if (!activo) {
            activo = await this.repo().findOne({
                where: [
                    { codigoQrToken: identifier },
                    { codigoInventario: identifier },
                ],
                relations: { sucursal: true, marcaRelacion: true },
            });
        }
        if (!activo) {
            throw new common_1.NotFoundException(`Activo con identificador ${identifier} no encontrado`);
        }
        return activo;
    }
    async create(dto) {
        const manager = this.transactionContext.getManager(this.dataSource);
        if (dto.numeroSerie) {
            const exists = await manager.findOne(activo_entity_1.Activo, {
                where: { numeroSerie: dto.numeroSerie },
            });
            if (exists) {
                throw new common_1.ConflictException('Número de serie ya registrado');
            }
        }
        const marca = await manager.findOne(marca_entity_1.Marca, { where: { id: dto.marcaId } });
        if (!marca) {
            throw new common_1.BadRequestException('Marca no encontrada');
        }
        const codigo = await this.codigoInventario.generarCodigo(manager, dto.sucursalId, dto.marcaId, dto.categoria, dto.fechaCompra);
        const activo = manager.create(activo_entity_1.Activo, {
            nombre: dto.nombre,
            marcaId: dto.marcaId,
            marca: marca.nombre,
            modelo: dto.modelo ?? null,
            numeroSerie: dto.numeroSerie ?? null,
            categoria: dto.categoria,
            sucursalId: dto.sucursalId,
            fechaCompra: dto.fechaCompra ?? null,
            fechaVencimientoGarantia: dto.fechaVencimientoGarantia ?? null,
            costoAdquisicion: dto.costoAdquisicion != null ? String(dto.costoAdquisicion) : null,
            documentacionUrls: dto.documentacionUrls ?? [],
            estadoOperacional: dto.estadoOperacional,
            codigoInventario: codigo,
            codigoQrToken: codigo,
        });
        const saved = await manager.save(activo);
        return this.findOne(saved.id);
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
        if (dto.marcaId != null) {
            const marca = await this.dataSource
                .getRepository(marca_entity_1.Marca)
                .findOne({ where: { id: dto.marcaId } });
            if (marca) {
                activo.marcaId = dto.marcaId;
                activo.marca = marca.nombre;
            }
        }
        Object.assign(activo, {
            ...dto,
            marcaId: dto.marcaId ?? activo.marcaId,
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
        transaction_context_service_1.TransactionContextService,
        codigo_inventario_service_1.CodigoInventarioService])
], ActivosService);
//# sourceMappingURL=activos.service.js.map