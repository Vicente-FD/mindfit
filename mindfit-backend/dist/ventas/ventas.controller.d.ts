import { VentasService } from './ventas.service';
export declare class VentasController {
    private readonly ventasService;
    constructor(ventasService: VentasService);
    dashboard(): Promise<import("./ventas.service").VentasDashboardDto>;
    dashboardEjecutivo(): Promise<import("./ventas.service").DashboardEjecutivoDto>;
    dashboardComercial(): Promise<import("./ventas.service").DashboardComercialDto>;
    catalogo(busqueda?: string, soloHabilitadas?: string): Promise<import("./ventas.service").CatalogoVentaItemDto[]>;
}
