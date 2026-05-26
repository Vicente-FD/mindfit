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
exports.LicenciasService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const typeorm_1 = require("typeorm");
const licencias_documentos_storage_1 = require("./storage/licencias-documentos.storage");
const enums_1 = require("../common/enums");
const licencia_tecnico_entity_1 = require("../entities/licencia-tecnico.entity");
const usuario_entity_1 = require("../entities/usuario.entity");
const licencias_alertas_util_1 = require("./licencias-alertas.util");
let LicenciasService = class LicenciasService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    licenciaRepo() {
        return this.dataSource.getRepository(licencia_tecnico_entity_1.LicenciaTecnico);
    }
    usuarioRepo() {
        return this.dataSource.getRepository(usuario_entity_1.Usuario);
    }
    async findPanel() {
        const tecnicos = await this.usuarioRepo().find({
            where: {
                rol: enums_1.RolUsuario.TECNICO,
                estaActivo: true,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            order: { nombre: 'ASC' },
        });
        const licencias = await this.licenciaRepo().find({
            where: { deletedAt: (0, typeorm_1.IsNull)() },
            relations: { tecnico: true },
        });
        const byTecnico = new Map(licencias.map((l) => [l.tecnicoId, l]));
        return tecnicos.map((t) => {
            const lic = byTecnico.get(t.id) ?? null;
            return {
                tecnicoId: t.id,
                tecnicoNombre: t.nombre,
                tecnicoEmail: t.email,
                licenciaId: lic?.id ?? null,
                tipoLicencia: lic?.tipoLicencia ?? null,
                fechaVencimiento: lic?.fechaVencimiento ?? null,
                documentoUrl: lic?.documentoUrl ?? null,
                diasRestantes: lic
                    ? (0, licencias_alertas_util_1.diasHastaVencimiento)(lic.fechaVencimiento)
                    : null,
            };
        });
    }
    findAll() {
        return this.licenciaRepo().find({
            where: { deletedAt: (0, typeorm_1.IsNull)() },
            relations: { tecnico: true },
            order: { fechaVencimiento: 'ASC' },
        });
    }
    async findAlertas() {
        const licencias = await this.findAll();
        return licencias.filter((l) => (0, licencias_alertas_util_1.licenciaRequiereAtencion)(l.fechaVencimiento));
    }
    async findOne(id) {
        const lic = await this.licenciaRepo().findOne({
            where: { id, deletedAt: (0, typeorm_1.IsNull)() },
            relations: { tecnico: true },
        });
        if (!lic)
            throw new common_1.NotFoundException(`Licencia ${id} no encontrada`);
        return lic;
    }
    async assertTecnicoActivo(tecnicoId) {
        const t = await this.usuarioRepo().findOne({
            where: {
                id: tecnicoId,
                rol: enums_1.RolUsuario.TECNICO,
                estaActivo: true,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
        if (!t) {
            throw new common_1.NotFoundException(`Técnico activo ${tecnicoId} no encontrado`);
        }
        return t;
    }
    async setDocumentoUrl(lic, filename) {
        const prev = lic.documentoUrl
            ? (0, licencias_documentos_storage_1.resolveLicenciaDiskPath)(lic.documentoUrl)
            : null;
        lic.documentoUrl = (0, licencias_documentos_storage_1.buildLicenciaPublicUrl)(filename);
        if (prev) {
            await (0, promises_1.unlink)(prev).catch(() => undefined);
        }
    }
    async create(dto, documentoFilename) {
        if (!documentoFilename?.trim()) {
            throw new common_1.BadRequestException('Documento de licencia requerido');
        }
        await this.assertTecnicoActivo(dto.tecnicoId);
        const documentoUrl = (0, licencias_documentos_storage_1.buildLicenciaPublicUrl)(documentoFilename);
        const existing = await this.licenciaRepo().findOne({
            where: { tecnicoId: dto.tecnicoId },
            withDeleted: true,
        });
        if (existing?.deletedAt == null && existing) {
            throw new common_1.ConflictException('El técnico ya tiene una licencia registrada. Use actualizar.');
        }
        if (existing?.deletedAt) {
            await this.licenciaRepo().recover(existing);
            existing.tipoLicencia = dto.tipoLicencia.trim();
            existing.fechaVencimiento = dto.fechaVencimiento;
            await this.setDocumentoUrl(existing, documentoFilename);
            return this.licenciaRepo().save(existing);
        }
        const lic = this.licenciaRepo().create({
            tecnicoId: dto.tecnicoId,
            tipoLicencia: dto.tipoLicencia.trim(),
            fechaVencimiento: dto.fechaVencimiento,
            documentoUrl,
        });
        return this.licenciaRepo().save(lic);
    }
    async update(id, dto, documentoFilename) {
        const lic = await this.findOne(id);
        if (dto.tipoLicencia !== undefined) {
            lic.tipoLicencia = dto.tipoLicencia.trim();
        }
        if (dto.fechaVencimiento !== undefined) {
            lic.fechaVencimiento = dto.fechaVencimiento;
        }
        if (documentoFilename) {
            await this.setDocumentoUrl(lic, documentoFilename);
        }
        return this.licenciaRepo().save(lic);
    }
    async remove(id) {
        const lic = await this.findOne(id);
        await this.licenciaRepo().softRemove(lic);
    }
};
exports.LicenciasService = LicenciasService;
exports.LicenciasService = LicenciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], LicenciasService);
//# sourceMappingURL=licencias.service.js.map