import { PrioridadOrden } from '../../common/enums';
import { type TipoReporteSucursal } from './tipo-reporte-sucursal';
export declare class ReportarFallaDto {
    tipoReporte?: TipoReporteSucursal;
    activoId?: number;
    descripcion: string;
    prioridad: PrioridadOrden;
    titulo?: string;
}
