import { Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import {
  EstadoCotizacionVenta,
  EstadoOperacionalActivo,
  EtapaOportunidad,
} from '../common/enums';
import { Activo } from '../entities/activo.entity';
import { CotizacionVenta } from '../entities/cotizacion-venta.entity';
import { Oportunidad } from '../entities/oportunidad.entity';
import { BodegaStock } from '../entities/bodega-stock.entity';
import { Repuesto } from '../entities/repuesto.entity';
import { AnalyticsService } from '../analytics/analytics.service';

export interface CatalogoVentaItemDto {
  tipo: 'activo';
  id: number;
  sku: string;
  nombre: string;
  modelo: string | null;
  marca: string;
  categoria: string;
  precioVentaClp: number;
  stockDisponible: number;
  habilitadoParaVenta: boolean;
}

export interface VentasDashboardDto {
  oportunidadesTotal: number;
  oportunidadesGanadas: number;
  tasaConversionPct: number;
  ticketPromedioCotizacion: number;
  montoPipelineAbierto: number;
  embudo: { etapa: string; cantidad: number; monto: number }[];
  cotizacionesMesActual: number;
  montoCotizadoMesActual: number;
}

export interface DashboardEjecutivoDto extends VentasDashboardDto {
  gastoAcumuladoMantenimiento: number;
  efectividadPe: number;
  mttrHoras: number;
  mtbfHoras: number | null;
  ingresosCotizacionesAprobadas: number;
  cotizacionesAprobadasMes: number;
  stockCriticoRepuestos: number;
  maquinasEnBodegaVenta: number;
}

/** Solo métricas comerciales (sin analytics de mantenimiento). */
export interface DashboardComercialDto extends VentasDashboardDto {
  ingresosCotizacionesAprobadasMes: number;
  ingresosCotizacionesAprobadasAnio: number;
  cotizacionesAprobadasMes: number;
  maquinasEnBodegaVenta: number;
  valorizacionBodegaComercial: number;
}

@Injectable()
export class VentasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async buscarCatalogo(
    busqueda?: string,
    soloHabilitadas = false,
  ): Promise<CatalogoVentaItemDto[]> {
    const q = busqueda?.trim().toLowerCase();

    const activosQb = this.dataSource
      .getRepository(Activo)
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.categoriaRelacion', 'cat')
      .where('a.deleted_at IS NULL')
      .andWhere('a.sucursal_id IS NULL')
      .andWhere('a.estado_operacional = :estado', {
        estado: EstadoOperacionalActivo.OPERATIVO,
      });

    if (soloHabilitadas) {
      activosQb.andWhere('a.apto_para_venta = true');
    }

    if (q) {
      activosQb.andWhere(
        `(LOWER(a.nombre) LIKE :q OR LOWER(a.codigo_inventario) LIKE :q
          OR LOWER(a.marca) LIKE :q OR LOWER(COALESCE(a.modelo, '')) LIKE :q
          OR LOWER(COALESCE(cat.nombre, '')) LIKE :q
          OR LOWER(a.categoria::text) LIKE :q)`,
        { q: `%${q}%` },
      );
    }

    const activos = await activosQb.orderBy('a.nombre', 'ASC').take(80).getMany();

    return activos.map((a) => ({
      tipo: 'activo' as const,
      id: a.id,
      sku:
        a.codigoInventario?.trim() ||
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

  async getDashboard(): Promise<VentasDashboardDto> {
    const oppRepo = this.dataSource.getRepository(Oportunidad);
    const cotRepo = this.dataSource.getRepository(CotizacionVenta);

    const oportunidades = await oppRepo.find();
    const total = oportunidades.length;
    const ganadas = oportunidades.filter(
      (o) => o.etapa === EtapaOportunidad.GANADA,
    ).length;

    const etapas = [
      EtapaOportunidad.PROSPECCION,
      EtapaOportunidad.CALIFICACION,
      EtapaOportunidad.PROPUESTA,
      EtapaOportunidad.GANADA,
      EtapaOportunidad.PERDIDA,
    ];

    const embudo = etapas.map((etapa) => {
      const rows = oportunidades.filter((o) => o.etapa === etapa);
      return {
        etapa,
        cantidad: rows.length,
        monto: rows.reduce((s, o) => s + Number(o.montoEstimado), 0),
      };
    });

    const abiertas = oportunidades.filter(
      (o) =>
        o.etapa !== EtapaOportunidad.GANADA &&
        o.etapa !== EtapaOportunidad.PERDIDA,
    );
    const montoPipelineAbierto = abiertas.reduce(
      (s, o) => s + Number(o.montoEstimado),
      0,
    );

    const cotizaciones = await cotRepo.find();
    const ticketPromedio =
      cotizaciones.length > 0
        ? cotizaciones.reduce((s, c) => s + Number(c.montoBruto), 0) /
          cotizaciones.length
        : 0;

    const now = new Date();
    const mesIni = new Date(now.getFullYear(), now.getMonth(), 1);
    const delMes = cotizaciones.filter((c) => c.createdAt >= mesIni);

    return {
      oportunidadesTotal: total,
      oportunidadesGanadas: ganadas,
      tasaConversionPct:
        total > 0 ? Math.round((ganadas / total) * 1000) / 10 : 0,
      ticketPromedioCotizacion: Math.round(ticketPromedio),
      montoPipelineAbierto: Math.round(montoPipelineAbierto),
      embudo,
      cotizacionesMesActual: delMes.length,
      montoCotizadoMesActual: Math.round(
        delMes.reduce((s, c) => s + Number(c.montoBruto), 0),
      ),
    };
  }

  async getDashboardComercial(): Promise<DashboardComercialDto> {
    const ventas = await this.getDashboard();
    const aprobadas = await this.listarCotizacionesAprobadas();
    const { mesIni, anioIni } = this.inicioMesYAnio();

    const delMes = aprobadas.filter((c) => c.createdAt >= mesIni);
    const delAnio = aprobadas.filter((c) => c.createdAt >= anioIni);

    const ingresosCotizacionesAprobadasMes = delMes.reduce(
      (s, c) => s + Number(c.montoBruto),
      0,
    );
    const ingresosCotizacionesAprobadasAnio = delAnio.reduce(
      (s, c) => s + Number(c.montoBruto),
      0,
    );

    const [maquinasEnBodegaVenta, valorizacionBodegaComercial] =
      await Promise.all([
        this.contarMaquinasBodegaVenta(),
        this.sumarValorizacionBodegaComercial(),
      ]);

    return {
      ...ventas,
      ingresosCotizacionesAprobadasMes: Math.round(
        ingresosCotizacionesAprobadasMes,
      ),
      ingresosCotizacionesAprobadasAnio: Math.round(
        ingresosCotizacionesAprobadasAnio,
      ),
      cotizacionesAprobadasMes: delMes.length,
      maquinasEnBodegaVenta,
      valorizacionBodegaComercial,
    };
  }

  async getDashboardEjecutivo(): Promise<DashboardEjecutivoDto> {
    const ventas = await this.getDashboard();
    const kpis = await this.analyticsService.getKpis({});

    const aprobadas = await this.listarCotizacionesAprobadas();
    const ingresosCotizacionesAprobadas = aprobadas.reduce(
      (s, c) => s + Number(c.montoBruto),
      0,
    );

    const { mesIni } = this.inicioMesYAnio();
    const cotizacionesAprobadasMes = aprobadas.filter(
      (c) => c.createdAt >= mesIni,
    ).length;

    const stockCritico = await this.dataSource
      .getRepository(BodegaStock)
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

  private inicioMesYAnio(): { mesIni: Date; anioIni: Date } {
    const now = new Date();
    const mesIni = new Date(now.getFullYear(), now.getMonth(), 1);
    mesIni.setHours(0, 0, 0, 0);
    const anioIni = new Date(now.getFullYear(), 0, 1);
    anioIni.setHours(0, 0, 0, 0);
    return { mesIni, anioIni };
  }

  private listarCotizacionesAprobadas(): Promise<CotizacionVenta[]> {
    return this.dataSource.getRepository(CotizacionVenta).find({
      where: { estado: EstadoCotizacionVenta.APROBADA },
    });
  }

  private contarMaquinasBodegaVenta(): Promise<number> {
    return this.dataSource.getRepository(Activo).count({
      where: {
        deletedAt: IsNull(),
        sucursalId: IsNull(),
        aptoParaVenta: true,
        estadoOperacional: EstadoOperacionalActivo.OPERATIVO,
      },
    });
  }

  private async sumarValorizacionBodegaComercial(): Promise<number> {
    const row = await this.dataSource
      .getRepository(Activo)
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.precio_venta_clp), 0)', 'total')
      .where('a.deleted_at IS NULL')
      .andWhere('a.sucursal_id IS NULL')
      .andWhere('a.apto_para_venta = true')
      .andWhere('a.estado_operacional = :estado', {
        estado: EstadoOperacionalActivo.OPERATIVO,
      })
      .getRawOne<{ total: string }>();

    return Math.round(Number(row?.total ?? 0));
  }
}
