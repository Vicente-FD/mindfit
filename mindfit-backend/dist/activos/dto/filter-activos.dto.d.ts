import { CategoriaActivo } from '../../common/enums';
export declare class FilterActivosDto {
    sucursalId?: number;
    marcaId?: number;
    categoriaId?: number;
    categoria?: CategoriaActivo;
    anioCompra?: number;
    busqueda?: string;
}
