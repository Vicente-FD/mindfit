import { CategoriaActivo, EstadoOperacionalActivo } from '../../common/enums';
export declare class UpdateActivoDto {
    nombre?: string;
    marcaId?: number;
    modelo?: string;
    numeroSerie?: string;
    categoria?: CategoriaActivo;
    sucursalId?: number;
    fechaCompra?: string;
    fechaVencimientoGarantia?: string;
    costoAdquisicion?: number;
    documentacionUrls?: string[];
    estadoOperacional?: EstadoOperacionalActivo;
}
