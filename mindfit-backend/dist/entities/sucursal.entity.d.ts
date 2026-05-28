import { Usuario } from './usuario.entity';
import { Activo } from './activo.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { FacilidadCritica } from './facilidad-critica.entity';
import type { CapacidadesServicios } from '../common/types/capacidades-servicios.types';
export declare class Sucursal {
    id: number;
    nombre: string;
    sigla: string;
    direccion: string | null;
    comuna: string | null;
    ciudad: string | null;
    estaActiva: boolean;
    cantidadPisos: number;
    capacidadesServicios: CapacidadesServicios | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    usuarios: Usuario[];
    activos: Activo[];
    ordenesTrabajo: OrdenTrabajo[];
    facilidadesCriticas: FacilidadCritica[];
}
