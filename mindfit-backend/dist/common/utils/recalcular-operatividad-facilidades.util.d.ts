import { EntityManager } from 'typeorm';
import { TipoFacilidadCritica } from '../enums';
import { OtServiciosContext } from './operatividad-servicios.util';
export interface RecalcularOperatividadOpts {
    tipos?: TipoFacilidadCritica[];
    excluirOtId?: number;
    reportadoPorId?: number;
    descripcionHistorial?: string;
}
export declare function recalcularOperatividadFacilidades(manager: EntityManager, sucursalId: number, opts?: RecalcularOperatividadOpts): Promise<void>;
export declare function tiposParaRecalcularDesdeOt(orden: OtServiciosContext): TipoFacilidadCritica[];
