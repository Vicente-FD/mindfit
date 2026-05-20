import { DataSource, EntityManager } from 'typeorm';
import { CategoriaActivo } from '../common/enums';
export declare class CodigoInventarioService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    generarCodigo(manager: EntityManager, sucursalId: number, marcaId: number, categoria: CategoriaActivo, fechaCompra?: string | null): Promise<string>;
    private resolveYear;
}
