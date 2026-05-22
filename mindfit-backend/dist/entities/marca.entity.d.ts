import { Activo } from './activo.entity';
export declare class Marca {
    id: number;
    nombre: string;
    sigla: string;
    logoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    activos: Activo[];
}
