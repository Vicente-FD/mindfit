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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarcasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const marca_entity_1 = require("../entities/marca.entity");
let MarcasService = class MarcasService {
    marcaRepo;
    constructor(marcaRepo) {
        this.marcaRepo = marcaRepo;
    }
    findAll() {
        return this.marcaRepo.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            order: { nombre: 'ASC' },
        });
    }
    async findOne(id) {
        const marca = await this.marcaRepo.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!marca) {
            throw new common_1.NotFoundException(`Marca ${id} no encontrada`);
        }
        return marca;
    }
    async create(dto, logoUrl) {
        const sigla = dto.sigla.trim().toUpperCase();
        const exists = await this.marcaRepo.findOne({
            where: [
                { nombre: dto.nombre.trim(), deletedAt: (0, typeorm_2.IsNull)() },
                { sigla, deletedAt: (0, typeorm_2.IsNull)() },
            ],
        });
        if (exists) {
            throw new common_1.ConflictException('Nombre o sigla de marca ya registrados');
        }
        const marca = this.marcaRepo.create({
            nombre: dto.nombre.trim(),
            sigla,
            logoUrl: logoUrl ?? null,
        });
        return this.marcaRepo.save(marca);
    }
    async update(id, dto, logoUrl) {
        const marca = await this.findOne(id);
        if (dto.nombre)
            marca.nombre = dto.nombre.trim();
        if (dto.sigla)
            marca.sigla = dto.sigla.trim().toUpperCase();
        if (logoUrl !== undefined)
            marca.logoUrl = logoUrl;
        return this.marcaRepo.save(marca);
    }
    async remove(id) {
        await this.findOne(id);
        await this.marcaRepo.softDelete(id);
        return { deleted: true };
    }
};
exports.MarcasService = MarcasService;
exports.MarcasService = MarcasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(marca_entity_1.Marca)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MarcasService);
//# sourceMappingURL=marcas.service.js.map