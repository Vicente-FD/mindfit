import { PrioridadOrden } from '../../common/enums';
import type { AreaFacilidad, GeneroFacilidad } from '../../common/utils/facilidades-criticas.util';
export declare const AREAS_FACILIDAD: readonly ["bano", "camarin", "ducha"];
export declare const GENEROS_FACILIDAD: readonly ["hombres", "mujeres"];
export declare class ReportarAreaServiciosDto {
    descripcionProblema: string;
    notasTecnicas?: string;
    prioridad?: PrioridadOrden;
    esFallaGeneral?: string;
    area?: AreaFacilidad;
    genero?: GeneroFacilidad;
}
