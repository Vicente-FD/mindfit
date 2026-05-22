import { CategoriaActivo } from '../common/enums';
export declare const SIGLA_TO_CATEGORIA_ENUM: Record<string, CategoriaActivo>;
export declare function categoriaEnumFromSigla(sigla: string): CategoriaActivo | null;
