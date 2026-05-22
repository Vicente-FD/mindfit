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
exports.RendicionesGastosService = exports.LIMITE_MENSUAL_GASTO = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const estado_rendicion_gasto_enum_1 = require("../common/enums/estado-rendicion-gasto.enum");
const enums_1 = require("../common/enums");
const rendicion_gasto_entity_1 = require("../entities/rendicion-gasto.entity");
const usuario_entity_1 = require("../entities/usuario.entity");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
const boletas_storage_1 = require("./storage/boletas.storage");
exports.LIMITE_MENSUAL_GASTO = 100_000;
let RendicionesGastosService = class RendicionesGastosService {
    dataSource;
    transactionContext;
    configService;
    constructor(dataSource, transactionContext, configService) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
        this.configService = configService;
    }
    repo() {
        return this.transactionContext.getRepository(rendicion_gasto_entity_1.RendicionGasto, this.dataSource);
    }
    usuarioRepo() {
        return this.transactionContext.getRepository(usuario_entity_1.Usuario, this.dataSource);
    }
    boundsForMes(mes) {
        let year;
        let monthIndex;
        if (mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
            const [y, m] = mes.split('-').map(Number);
            year = y;
            monthIndex = m - 1;
        }
        else {
            const now = new Date();
            year = now.getFullYear();
            monthIndex = now.getMonth();
        }
        const mesKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
        const desde = `${mesKey}-01`;
        const lastDay = new Date(year, monthIndex + 1, 0).getDate();
        const hasta = `${mesKey}-${String(lastDay).padStart(2, '0')}`;
        return { mes: mesKey, desde, hasta };
    }
    monthBounds() {
        const { desde, hasta } = this.boundsForMes();
        return { desde, hasta };
    }
    async findLista(filters, options) {
        const { mes, desde, hasta } = this.boundsForMes(filters.mes);
        const qb = this.repo()
            .createQueryBuilder('g')
            .leftJoinAndSelect('g.tecnico', 'tecnico')
            .where('g.fecha_gasto >= :desde', { desde })
            .andWhere('g.fecha_gasto <= :hasta', { hasta });
        const tecnicoFilter = options?.tecnicoIdScope ?? filters.tecnicoId;
        if (tecnicoFilter != null) {
            qb.andWhere('g.tecnico_id = :tecnicoId', { tecnicoId: tecnicoFilter });
        }
        if (filters.estado) {
            qb.andWhere('g.estado = :estado', { estado: filters.estado });
        }
        qb.orderBy('g.fecha_gasto', 'DESC').addOrderBy('g.created_at', 'DESC');
        const rows = await qb.getMany();
        const items = rows.map((g) => this.toDto(g));
        let totalAprobado = 0;
        let totalPendiente = 0;
        let totalRechazado = 0;
        for (const item of items) {
            const m = item.monto;
            if (item.estado === estado_rendicion_gasto_enum_1.EstadoRendicionGasto.APROBADO)
                totalAprobado += m;
            else if (item.estado === estado_rendicion_gasto_enum_1.EstadoRendicionGasto.PENDIENTE)
                totalPendiente += m;
            else if (item.estado === estado_rendicion_gasto_enum_1.EstadoRendicionGasto.RECHAZADO)
                totalRechazado += m;
        }
        return {
            mes,
            desde,
            hasta,
            items,
            resumen: {
                totalAprobado,
                totalPendiente,
                totalRechazado,
                totalGeneral: totalAprobado + totalPendiente + totalRechazado,
                cantidad: items.length,
            },
        };
    }
    async sumAprobadosMes(tecnicoId, mes) {
        const { desde, hasta } = this.boundsForMes(mes);
        const row = await this.repo()
            .createQueryBuilder('g')
            .select('COALESCE(SUM(g.monto), 0)', 'total')
            .where('g.tecnico_id = :tecnicoId', { tecnicoId })
            .andWhere('g.estado = :estado', { estado: estado_rendicion_gasto_enum_1.EstadoRendicionGasto.APROBADO })
            .andWhere('g.fecha_gasto >= :desde', { desde })
            .andWhere('g.fecha_gasto <= :hasta', { hasta })
            .getRawOne();
        return Number(row?.total ?? 0);
    }
    async calcSaldoDisponible(tecnicoId) {
        const aprobado = await this.sumAprobadosMes(tecnicoId);
        return Math.max(0, exports.LIMITE_MENSUAL_GASTO - aprobado);
    }
    async create(tecnicoId, dto, boletaFilename) {
        const saldo = await this.calcSaldoDisponible(tecnicoId);
        if (saldo - dto.monto < 0) {
            throw new common_1.BadRequestException('Has excedido tu límite de saldo mensual de 100.000 pesos');
        }
        const port = this.configService.get('PORT', 3000);
        const urlBoleta = (0, boletas_storage_1.buildBoletaPublicUrl)(boletaFilename, port);
        const hoy = new Date().toISOString().slice(0, 10);
        const saved = await this.repo().save(this.repo().create({
            tecnicoId,
            monto: dto.monto,
            descripcion: dto.descripcion.trim(),
            urlBoleta,
            estado: estado_rendicion_gasto_enum_1.EstadoRendicionGasto.PENDIENTE,
            motivoRechazo: null,
            fechaGasto: hoy,
        }));
        const withTecnico = await this.repo().findOne({
            where: { id: saved.id },
            relations: { tecnico: true },
        });
        return this.toDto(withTecnico);
    }
    async findMiSaldo(tecnicoId) {
        const montoAprobadoMes = await this.sumAprobadosMes(tecnicoId);
        const saldoDisponible = Math.max(0, exports.LIMITE_MENSUAL_GASTO - montoAprobadoMes);
        const list = await this.repo().find({
            where: { tecnicoId },
            relations: { tecnico: true },
            order: { createdAt: 'DESC' },
        });
        return {
            limiteMensual: exports.LIMITE_MENSUAL_GASTO,
            montoAprobadoMes,
            saldoDisponible,
            historial: list.map((g) => this.toDto(g)),
        };
    }
    async findAdminView() {
        const pendientes = await this.repo().find({
            where: { estado: estado_rendicion_gasto_enum_1.EstadoRendicionGasto.PENDIENTE },
            relations: { tecnico: true },
            order: { createdAt: 'ASC' },
        });
        const tecnicos = await this.usuarioRepo().find({
            where: {
                rol: enums_1.RolUsuario.TECNICO,
                estaActivo: true,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            order: { nombre: 'ASC' },
            select: {
                id: true,
                nombre: true,
                email: true,
            },
        });
        const tecnicosResumen = [];
        for (const t of tecnicos) {
            tecnicosResumen.push(await this.buildSaldoTecnico(t));
        }
        return {
            pendientes: pendientes.map((g) => this.toDto(g)),
            tecnicos: tecnicosResumen,
        };
    }
    async decidir(id, dto) {
        const gasto = await this.repo().findOne({
            where: { id },
            relations: { tecnico: true },
        });
        if (!gasto) {
            throw new common_1.NotFoundException(`Rendición de gasto ${id} no encontrada`);
        }
        if (gasto.estado !== estado_rendicion_gasto_enum_1.EstadoRendicionGasto.PENDIENTE) {
            throw new common_1.BadRequestException('Solo se pueden decidir rendiciones en estado pendiente');
        }
        if (dto.estado === estado_rendicion_gasto_enum_1.EstadoRendicionGasto.RECHAZADO) {
            if (!dto.motivoRechazo?.trim()) {
                throw new common_1.BadRequestException('Debe indicar el motivo de rechazo');
            }
            gasto.estado = estado_rendicion_gasto_enum_1.EstadoRendicionGasto.RECHAZADO;
            gasto.motivoRechazo = dto.motivoRechazo.trim();
        }
        else {
            const saldo = await this.calcSaldoDisponible(gasto.tecnicoId);
            if (gasto.monto > saldo) {
                throw new common_1.BadRequestException(`El técnico ya no tiene saldo suficiente para aprobar este gasto (disponible: $${Math.round(saldo).toLocaleString('es-CL')})`);
            }
            gasto.estado = estado_rendicion_gasto_enum_1.EstadoRendicionGasto.APROBADO;
            gasto.motivoRechazo = null;
        }
        const saved = await this.repo().save(gasto);
        return this.toDto(saved);
    }
    async buildSaldoTecnico(usuario) {
        const montoAprobadoMes = await this.sumAprobadosMes(usuario.id);
        const saldoDisponible = Math.max(0, exports.LIMITE_MENSUAL_GASTO - montoAprobadoMes);
        const porcentajeConsumido = exports.LIMITE_MENSUAL_GASTO > 0
            ? Math.min(100, (montoAprobadoMes / exports.LIMITE_MENSUAL_GASTO) * 100)
            : 0;
        const alertaSaldoBajo = saldoDisponible < exports.LIMITE_MENSUAL_GASTO * 0.15;
        return {
            tecnicoId: usuario.id,
            tecnicoNombre: usuario.nombre,
            tecnicoEmail: usuario.email,
            limiteMensual: exports.LIMITE_MENSUAL_GASTO,
            montoAprobadoMes,
            saldoDisponible,
            porcentajeConsumido: Math.round(porcentajeConsumido * 10) / 10,
            alertaSaldoBajo,
        };
    }
    toDto(gasto) {
        return {
            id: gasto.id,
            tecnicoId: gasto.tecnicoId,
            tecnicoNombre: gasto.tecnico?.nombre ?? `Técnico #${gasto.tecnicoId}`,
            monto: Number(gasto.monto),
            descripcion: gasto.descripcion,
            urlBoleta: gasto.urlBoleta,
            estado: gasto.estado,
            motivoRechazo: gasto.motivoRechazo,
            fechaGasto: typeof gasto.fechaGasto === 'string'
                ? gasto.fechaGasto
                : String(gasto.fechaGasto).slice(0, 10),
            createdAt: gasto.createdAt,
            updatedAt: gasto.updatedAt,
        };
    }
};
exports.RendicionesGastosService = RendicionesGastosService;
exports.RendicionesGastosService = RendicionesGastosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService,
        config_1.ConfigService])
], RendicionesGastosService);
//# sourceMappingURL=rendiciones-gastos.service.js.map