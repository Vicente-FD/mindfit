import { OrdenTrabajo } from './orden-trabajo.entity';
import { Usuario } from './usuario.entity';
export declare class ComentarioOt {
    id: number;
    ordenTrabajoId: number;
    ordenTrabajo: OrdenTrabajo;
    autorId: number;
    autor: Usuario;
    comentario: string;
    createdAt: Date;
}
