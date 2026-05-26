import { DataSource, EntityManager } from 'typeorm';
export declare class CodigoInventarioService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    generarCodigo(manager: EntityManager, sucursalId: number | null | undefined, marcaId: number, categoriaId: number, fechaCompra?: string | null): Promise<string>;
    private resolveYear;
}
