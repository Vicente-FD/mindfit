import { Activo } from './activo.entity';
export declare class Categoria {
    id: number;
    nombre: string;
    sigla: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    activos: Activo[];
}
