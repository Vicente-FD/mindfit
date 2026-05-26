import { EstadoOperacionalActivo } from '../../common/enums';
export declare class UpdateActivoDto {
    nombre?: string;
    marcaId?: number;
    modelo?: string;
    numeroSerie?: string;
    categoriaId?: number;
    sucursalId?: number | null;
    pisoAsignado?: number | null;
    fechaCompra?: string;
    fechaVencimientoGarantia?: string;
    costoAdquisicion?: number;
    documentacionUrls?: string[];
    estadoOperacional?: EstadoOperacionalActivo;
    aptoParaVenta?: boolean;
    precioVentaClp?: number;
}
