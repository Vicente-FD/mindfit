import type { CapacidadesServicios } from '../../common/types/capacidades-servicios.types';
export declare class CreateSucursalDto {
    nombre: string;
    sigla: string;
    direccion: string;
    comuna: string;
    ciudad: string;
    estaActiva?: boolean;
    cantidadPisos?: number;
    capacidadesServicios?: CapacidadesServicios;
}
