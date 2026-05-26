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
exports.VentasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const activo_entity_1 = require("../entities/activo.entity");
const cotizacion_venta_entity_1 = require("../entities/cotizacion-venta.entity");
const oportunidad_entity_1 = require("../entities/oportunidad.entity");
const bodega_stock_entity_1 = require("../entities/bodega-stock.entity");
const analytics_service_1 = require("../analytics/analytics.service");
let VentasService = class VentasService {
    dataSource;
    analyticsService;
    constructor(dataSource, analyticsService) {
        this.dataSource = dataSource;
        this.analyticsService = analyticsService;
    }
    async buscarCatalogo(busqueda, soloHabilitadas = false) {
        const q = busqueda?.trim().toLowerCase();
        const activosQb = this.dataSource
            .getRepository(activo_entity_1.Activo)
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.categoriaRelacion', 'cat')
            .where('a.deleted_at IS NULL')
            .andWhere('a.sucursal_id IS NULL')
            .andWhere('a.estado_operacional = :estado', {
            estado: enums_1.EstadoOperacionalActivo.OPERATIVO,
        });
        if (soloHabilitadas) {
            activosQb.andWhere('a.apto_para_venta = true');
        }
        if (q) {
            activosQb.andWhere(`(LOWER(a.nombre) LIKE :q OR LOWER(a.codigo_inventario) LIKE :q
          OR LOWER(a.marca) LIKE :q OR LOWER(COALESCE(a.modelo, '')) LIKE :q
          OR LOWER(COALESCE(cat.nombre, '')) LIKE :q
          OR LOWER(a.categoria::text) LIKE :q)`, { q: `%${q}%` });
        }
        const activos = await activosQb.orderBy('a.nombre', 'ASC').take(80).getMany();
        return activos.map((a) => ({
            tipo: 'activo',
            id: a.id,
            sku: a.codigoInventario?.trim() ||
                a.codigoQrToken?.trim() ||
                `ACT-${a.id}`,
            nombre: a.nombre,
            modelo: a.modelo,
            marca: a.marca ?? '—',
            categoria: a.categoriaRelacion?.nombre ?? a.categoria ?? 'Equipo',
            precioVentaClp: Number(a.precioVentaClp ?? 0),
            stockDisponible: 1,
            habilitadoParaVenta: a.aptoParaVenta === true,
        }));
    }
    async getDashboard() {
        const oppRepo = this.dataSource.getRepository(oportunidad_entity_1.Oportunidad);
        const cotRepo = this.dataSource.getRepository(cotizacion_venta_entity_1.CotizacionVenta);
        const oportunidades = await oppRepo.find();
        const total = oportunidades.length;
        const ganadas = oportunidades.filter((o) => o.etapa === enums_1.EtapaOportunidad.GANADA).length;
        const etapas = [
            enums_1.EtapaOportunidad.PROSPECCION,
            enums_1.EtapaOportunidad.CALIFICACION,
            enums_1.EtapaOportunidad.PROPUESTA,
            enums_1.EtapaOportunidad.GANADA,
            enums_1.EtapaOportunidad.PERDIDA,
        ];
        const embudo = etapas.map((etapa) => {
            const rows = oportunidades.filter((o) => o.etapa === etapa);
            return {
                etapa,
                cantidad: rows.length,
                monto: rows.reduce((s, o) => s + Number(o.montoEstimado), 0),
            };
        });
        const abiertas = oportunidades.filter((o) => o.etapa !== enums_1.EtapaOportunidad.GANADA &&
            o.etapa !== enums_1.EtapaOportunidad.PERDIDA);
        const montoPipelineAbierto = abiertas.reduce((s, o) => s + Number(o.montoEstimado), 0);
        const cotizaciones = await cotRepo.find();
        const ticketPromedio = cotizaciones.length > 0
            ? cotizaciones.reduce((s, c) => s + Number(c.montoBruto), 0) /
                cotizaciones.length
            : 0;
        const now = new Date();
        const mesIni = new Date(now.getFullYear(), now.getMonth(), 1);
        const delMes = cotizaciones.filter((c) => c.createdAt >= mesIni);
        return {
            oportunidadesTotal: total,
            oportunidadesGanadas: ganadas,
            tasaConversionPct: total > 0 ? Math.round((ganadas / total) * 1000) / 10 : 0,
            ticketPromedioCotizacion: Math.round(ticketPromedio),
            montoPipelineAbierto: Math.round(montoPipelineAbierto),
            embudo,
            cotizacionesMesActual: delMes.length,
            montoCotizadoMesActual: Math.round(delMes.reduce((s, c) => s + Number(c.montoBruto), 0)),
        };
    }
    async getDashboardComercial() {
        const ventas = await this.getDashboard();
        const aprobadas = await this.listarCotizacionesAprobadas();
        const { mesIni, anioIni } = this.inicioMesYAnio();
        const delMes = aprobadas.filter((c) => c.createdAt >= mesIni);
        const delAnio = aprobadas.filter((c) => c.createdAt >= anioIni);
        const ingresosCotizacionesAprobadasMes = delMes.reduce((s, c) => s + Number(c.montoBruto), 0);
        const ingresosCotizacionesAprobadasAnio = delAnio.reduce((s, c) => s + Number(c.montoBruto), 0);
        const [maquinasEnBodegaVenta, valorizacionBodegaComercial] = await Promise.all([
            this.contarMaquinasBodegaVenta(),
            this.sumarValorizacionBodegaComercial(),
        ]);
        return {
            ...ventas,
            ingresosCotizacionesAprobadasMes: Math.round(ingresosCotizacionesAprobadasMes),
            ingresosCotizacionesAprobadasAnio: Math.round(ingresosCotizacionesAprobadasAnio),
            cotizacionesAprobadasMes: delMes.length,
            maquinasEnBodegaVenta,
            valorizacionBodegaComercial,
        };
    }
    async getDashboardEjecutivo() {
        const ventas = await this.getDashboard();
        const kpis = await this.analyticsService.getKpis({});
        const aprobadas = await this.listarCotizacionesAprobadas();
        const ingresosCotizacionesAprobadas = aprobadas.reduce((s, c) => s + Number(c.montoBruto), 0);
        const { mesIni } = this.inicioMesYAnio();
        const cotizacionesAprobadasMes = aprobadas.filter((c) => c.createdAt >= mesIni).length;
        const stockCritico = await this.dataSource
            .getRepository(bodega_stock_entity_1.BodegaStock)
            .createQueryBuilder('bs')
            .innerJoin('bs.repuesto', 'repuesto')
            .where('repuesto.deleted_at IS NULL')
            .andWhere('bs.cantidad_actual <= bs.cantidad_minima_alerta')
            .getCount();
        const maquinasEnBodegaVenta = await this.contarMaquinasBodegaVenta();
        return {
            ...ventas,
            gastoAcumuladoMantenimiento: kpis.gastoAcumuladoMantenimiento,
            efectividadPe: kpis.efectividadPe,
            mttrHoras: kpis.mttrHoras,
            mtbfHoras: kpis.mtbfHoras,
            ingresosCotizacionesAprobadas: Math.round(ingresosCotizacionesAprobadas),
            cotizacionesAprobadasMes,
            stockCriticoRepuestos: stockCritico,
            maquinasEnBodegaVenta,
        };
    }
    inicioMesYAnio() {
        const now = new Date();
        const mesIni = new Date(now.getFullYear(), now.getMonth(), 1);
        mesIni.setHours(0, 0, 0, 0);
        const anioIni = new Date(now.getFullYear(), 0, 1);
        anioIni.setHours(0, 0, 0, 0);
        return { mesIni, anioIni };
    }
    listarCotizacionesAprobadas() {
        return this.dataSource.getRepository(cotizacion_venta_entity_1.CotizacionVenta).find({
            where: { estado: enums_1.EstadoCotizacionVenta.APROBADA },
        });
    }
    contarMaquinasBodegaVenta() {
        return this.dataSource.getRepository(activo_entity_1.Activo).count({
            where: {
                deletedAt: (0, typeorm_1.IsNull)(),
                sucursalId: (0, typeorm_1.IsNull)(),
                aptoParaVenta: true,
                estadoOperacional: enums_1.EstadoOperacionalActivo.OPERATIVO,
            },
        });
    }
    async sumarValorizacionBodegaComercial() {
        const row = await this.dataSource
            .getRepository(activo_entity_1.Activo)
            .createQueryBuilder('a')
            .select('COALESCE(SUM(a.precio_venta_clp), 0)', 'total')
            .where('a.deleted_at IS NULL')
            .andWhere('a.sucursal_id IS NULL')
            .andWhere('a.apto_para_venta = true')
            .andWhere('a.estado_operacional = :estado', {
            estado: enums_1.EstadoOperacionalActivo.OPERATIVO,
        })
            .getRawOne();
        return Math.round(Number(row?.total ?? 0));
    }
};
exports.VentasService = VentasService;
exports.VentasService = VentasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        analytics_service_1.AnalyticsService])
], VentasService);
//# sourceMappingURL=ventas.service.js.map