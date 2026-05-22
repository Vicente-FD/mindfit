import { EstadoOperacionalActivo } from '../../common/enums';
export declare class CreateActivoDto {
    nombre: string;
    marcaId: number;
    categoriaId: number;
    modelo?: string;
    numeroSerie?: string;
    sucursalId: number;
    pisoAsignado?: number | null;
    fechaCompra?: string;
    fechaVencimientoGarantia?: string;
    costoAdquisicion?: number;
    documentacionUrls?: string[];
    estadoOperacional?: EstadoOperacionalActivo;
}
