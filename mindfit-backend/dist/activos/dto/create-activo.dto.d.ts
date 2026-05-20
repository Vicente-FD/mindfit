import { CategoriaActivo, EstadoOperacionalActivo } from '../../common/enums';
export declare class CreateActivoDto {
    nombre: string;
    marca?: string;
    modelo?: string;
    numeroSerie?: string;
    categoria: CategoriaActivo;
    sucursalId: number;
    fechaCompra?: string;
    fechaVencimientoGarantia?: string;
    costoAdquisicion?: number;
    documentacionUrls?: string[];
    estadoOperacional?: EstadoOperacionalActivo;
}
