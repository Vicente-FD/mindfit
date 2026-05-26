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
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const cliente_entity_1 = require("../entities/cliente.entity");
let ClientesService = class ClientesService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    repo() {
        return this.dataSource.getRepository(cliente_entity_1.Cliente);
    }
    findAll() {
        return this.repo().find({
            where: { deletedAt: (0, typeorm_1.IsNull)() },
            order: { razonSocial: 'ASC' },
        });
    }
    async findOne(id) {
        const c = await this.repo().findOne({
            where: { id, deletedAt: (0, typeorm_1.IsNull)() },
        });
        if (!c)
            throw new common_1.NotFoundException(`Cliente ${id} no encontrado`);
        return c;
    }
    async create(dto) {
        const rut = dto.rut.trim().toUpperCase();
        const email = dto.email.trim().toLowerCase();
        const dupRut = await this.repo().findOne({
            where: { rut },
            withDeleted: true,
        });
        const dupEmail = await this.repo().findOne({
            where: { email },
            withDeleted: true,
        });
        const reviveTarget = dupRut?.deletedAt ? dupRut : dupEmail?.deletedAt ? dupEmail : null;
        if (reviveTarget) {
            await this.repo().recover(reviveTarget);
            reviveTarget.rut = rut;
            reviveTarget.razonSocial = dto.razonSocial.trim();
            reviveTarget.email = email;
            reviveTarget.telefono = dto.telefono?.trim() ?? null;
            reviveTarget.direccion = dto.direccion.trim();
            reviveTarget.comuna = dto.comuna.trim();
            reviveTarget.ciudad = dto.ciudad.trim();
            return this.repo().save(reviveTarget);
        }
        if (dupRut?.deletedAt == null && dupRut) {
            throw new common_1.ConflictException(`RUT ${rut} ya registrado`);
        }
        if (dupEmail?.deletedAt == null && dupEmail) {
            throw new common_1.ConflictException('Email ya registrado');
        }
        const cliente = this.repo().create({
            rut,
            razonSocial: dto.razonSocial.trim(),
            email: dto.email.trim().toLowerCase(),
            telefono: dto.telefono?.trim() ?? null,
            direccion: dto.direccion.trim(),
            comuna: dto.comuna.trim(),
            ciudad: dto.ciudad.trim(),
        });
        return this.repo().save(cliente);
    }
    async update(id, dto) {
        const cliente = await this.findOne(id);
        if (dto.rut != null) {
            const rut = dto.rut.trim().toUpperCase();
            const dup = await this.repo().findOne({ where: { rut } });
            if (dup && dup.id !== id && !dup.deletedAt) {
                throw new common_1.ConflictException(`RUT ${rut} ya está en uso`);
            }
            cliente.rut = rut;
        }
        if (dto.razonSocial != null)
            cliente.razonSocial = dto.razonSocial.trim();
        if (dto.email != null) {
            const email = dto.email.trim().toLowerCase();
            const dup = await this.repo().findOne({ where: { email } });
            if (dup && dup.id !== id && !dup.deletedAt) {
                throw new common_1.ConflictException('Email ya está en uso');
            }
            cliente.email = email;
        }
        if (dto.telefono !== undefined) {
            cliente.telefono = dto.telefono?.trim() ?? null;
        }
        if (dto.direccion != null)
            cliente.direccion = dto.direccion.trim();
        if (dto.comuna != null)
            cliente.comuna = dto.comuna.trim();
        if (dto.ciudad != null)
            cliente.ciudad = dto.ciudad.trim();
        return this.repo().save(cliente);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo().softDelete(id);
        return { deleted: true };
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map