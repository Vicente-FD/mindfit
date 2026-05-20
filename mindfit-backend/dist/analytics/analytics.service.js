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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activo_entity_1 = require("../entities/activo.entity");
const orden_trabajo_entity_1 = require("../entities/orden-trabajo.entity");
const usuario_entity_1 = require("../entities/usuario.entity");
const enums_1 = require("../common/enums");
let AnalyticsService = class AnalyticsService {
    ordenRepo;
    activoRepo;
    usuarioRepo;
    constructor(ordenRepo, activoRepo, usuarioRepo) {
        this.ordenRepo = ordenRepo;
        this.activoRepo = activoRepo;
        this.usuarioRepo = usuarioRepo;
    }
    async getKpis(filters) {
        const qb = this.ordenRepo
            .createQueryBuilder('ot')
            .leftJoinAndSelect('ot.sucursal', 'sucursal')
            .leftJoinAndSelect('ot.activo', 'activo');
        if (filters.sucursalId) {
            qb.andWhere('ot.sucursal_id = :sucursalId', {
                sucursalId: filters.sucursalId,
            });
        }
        if (filters.tecnicoId) {
            qb.andWhere('ot.asignado_a_id = :tecnicoId', {
                tecnicoId: filters.tecnicoId,
            });
        }
        if (filters.categoria) {
            qb.andWhere('activo.categoria = :categoria', {
                categoria: filters.categoria,
            });
        }
        qb.andWhere('ot.deleted_at IS NULL');
        const ordenes = await qb.getMany();
        const otsReportadas = ordenes.length;
        const otsResueltas = ordenes.filter((o) => [enums_1.EstadoOrdenTrabajo.FINALIZADA, enums_1.EstadoOrdenTrabajo.APROBADA].includes(o.estado)).length;
        const efectividadPe = otsReportadas > 0
            ? Math.round((otsResueltas / otsReportadas) * 1000) / 10
            : 0;
        const cerradas = ordenes.filter((o) => o.fechaInicioReal &&
            o.fechaFinReal &&
            [enums_1.EstadoOrdenTrabajo.FINALIZADA, enums_1.EstadoOrdenTrabajo.APROBADA].includes(o.estado));
        let mttrHoras = 0;
        if (cerradas.length > 0) {
            const totalMs = cerradas.reduce((acc, o) => {
                const start = new Date(o.fechaInicioReal).getTime();
                const end = new Date(o.fechaFinReal).getTime();
                return acc + Math.max(0, end - start);
            }, 0);
            mttrHoras = Math.round((totalMs / cerradas.length / 3600000) * 10) / 10;
        }
        const activoQb = this.activoRepo
            .createQueryBuilder('a')
            .leftJoin('a.sucursal', 'sucursal');
        if (filters.sucursalId) {
            activoQb.andWhere('a.sucursal_id = :sucursalId', {
                sucursalId: filters.sucursalId,
            });
        }
        if (filters.categoria) {
            activoQb.andWhere('a.categoria = :categoria', {
                categoria: filters.categoria,
            });
        }
        const activos = await activoQb.getMany();
        const gastoAcumuladoMantenimiento = activos.reduce((acc, a) => {
            const cost = a.costoAdquisicion ? parseFloat(a.costoAdquisicion) : 0;
            return acc + (Number.isFinite(cost) ? cost : 0);
        }, 0);
        const fallasMap = new Map();
        for (const o of ordenes) {
            const cat = o.activo?.categoria ?? 'sin_categoria';
            fallasMap.set(cat, (fallasMap.get(cat) ?? 0) + 1);
        }
        const sucursalMap = new Map();
        for (const o of ordenes) {
            const name = o.sucursal?.nombre ?? `Sede ${o.sucursalId}`;
            sucursalMap.set(name, (sucursalMap.get(name) ?? 0) + 1);
        }
        return {
            efectividadPe,
            otsReportadas,
            otsResueltas,
            gastoAcumuladoMantenimiento: Math.round(gastoAcumuladoMantenimiento),
            mttrHoras,
            fallasPorCategoria: Array.from(fallasMap.entries()).map(([categoria, total]) => ({ categoria, total })),
            otsPorSucursal: Array.from(sucursalMap.entries()).map(([sucursal, total]) => ({ sucursal, total })),
        };
    }
    async listTecnicos() {
        return this.usuarioRepo.find({
            where: { rol: enums_1.RolUsuario.TECNICO, estaActivo: true },
            select: {
                id: true,
                nombre: true,
                email: true,
                sucursalId: true,
            },
            order: { nombre: 'ASC' },
        });
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orden_trabajo_entity_1.OrdenTrabajo)),
    __param(1, (0, typeorm_1.InjectRepository)(activo_entity_1.Activo)),
    __param(2, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map