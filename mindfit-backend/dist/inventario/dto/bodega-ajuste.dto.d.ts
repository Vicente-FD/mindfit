import { TipoMovimientoInventario } from '../../common/enums';
export declare class BodegaAjusteDto {
    sucursalId: number;
    repuestoId: number;
    cantidad: number;
    tipoMovimiento: TipoMovimientoInventario;
    motivo: string;
}
