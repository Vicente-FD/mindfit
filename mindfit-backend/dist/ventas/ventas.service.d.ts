import { DataSource } from 'typeorm';
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
    embudo: {
        etapa: string;
        cantidad: number;
        monto: number;
    }[];
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
export interface DashboardComercialDto extends VentasDashboardDto {
    ingresosCotizacionesAprobadasMes: number;
    ingresosCotizacionesAprobadasAnio: number;
    cotizacionesAprobadasMes: number;
    maquinasEnBodegaVenta: number;
    valorizacionBodegaComercial: number;
}
export declare class VentasService {
    private readonly dataSource;
    private readonly analyticsService;
    constructor(dataSource: DataSource, analyticsService: AnalyticsService);
    buscarCatalogo(busqueda?: string, soloHabilitadas?: boolean): Promise<CatalogoVentaItemDto[]>;
    getDashboard(): Promise<VentasDashboardDto>;
    getDashboardComercial(): Promise<DashboardComercialDto>;
    getDashboardEjecutivo(): Promise<DashboardEjecutivoDto>;
    private inicioMesYAnio;
    private listarCotizacionesAprobadas;
    private contarMaquinasBodegaVenta;
    private sumarValorizacionBodegaComercial;
}
