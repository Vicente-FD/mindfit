import { ActivoHistorialItemDto } from './activo-historial.dto';
export type TipoHistorialActivoEvento = 'orden_trabajo' | 'traslado';
export interface ActivoHistorialTrasladoDto {
    destino: string;
    sucursalIdAnterior: number | null;
    sucursalIdNuevo: number | null;
}
export interface ActivoHistorialEventoDto {
    tipo: TipoHistorialActivoEvento;
    id: string;
    fecha: string;
    titulo: string;
    descripcion: string | null;
    usuarioNombre: string | null;
    orden?: ActivoHistorialItemDto;
    traslado?: ActivoHistorialTrasladoDto;
}
