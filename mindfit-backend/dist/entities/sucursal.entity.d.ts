import { Usuario } from './usuario.entity';
import { Activo } from './activo.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
export declare class Sucursal {
    id: number;
    nombre: string;
    sigla: string | null;
    direccion: string | null;
    comuna: string | null;
    ciudad: string | null;
    estaActiva: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    usuarios: Usuario[];
    activos: Activo[];
    ordenesTrabajo: OrdenTrabajo[];
}
