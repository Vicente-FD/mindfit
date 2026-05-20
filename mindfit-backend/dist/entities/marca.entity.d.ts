import { Activo } from './activo.entity';
export declare class Marca {
    id: number;
    nombre: string;
    sigla: string;
    createdAt: Date;
    updatedAt: Date;
    activos: Activo[];
}
