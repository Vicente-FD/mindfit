import { PrioridadOrden } from '../../common/enums';
import { type TipoReporteSucursal } from './tipo-reporte-sucursal';
export declare class ReportarFallaDto {
    tipoReporte?: TipoReporteSucursal;
    activoId?: number;
    descripcion: string;
    prioridad: PrioridadOrden;
    titulo?: string;
    sucursalId?: number;
    asignadoAId?: number;
    areaServicios?: 'bano' | 'camarin' | 'ducha';
    generoServicios?: 'hombres' | 'mujeres' | string;
    generosServicios?: string;
    fallaGeneralServicios?: string;
}
