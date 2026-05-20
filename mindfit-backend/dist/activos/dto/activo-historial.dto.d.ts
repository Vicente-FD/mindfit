import { EstadoOrdenTrabajo, PrioridadOrden, TipoEvidencia, TipoMantenimiento } from '../../common/enums';
export interface HistorialUsuarioDto {
    id: number;
    nombre: string;
    email?: string;
    rol?: string;
}
export interface HistorialEvidenciaDto {
    id: number;
    tipoEvidencia: TipoEvidencia;
    urlImagen: string;
    createdAt: string;
}
export interface HistorialComentarioDto {
    id: number;
    comentario: string;
    autor: HistorialUsuarioDto;
    createdAt: string;
}
export interface ActivoHistorialItemDto {
    id: number;
    codigoOt: string;
    titulo: string;
    descripcion: string | null;
    prioridad: PrioridadOrden;
    tipoMantenimiento: TipoMantenimiento;
    estado: EstadoOrdenTrabajo;
    fechaResolucion: string | null;
    duracionLabel: string | null;
    creadoPor: HistorialUsuarioDto;
    asignadoA: HistorialUsuarioDto | null;
    comentarioCierre: string | null;
    evidencias: HistorialEvidenciaDto[];
    comentarios: HistorialComentarioDto[];
}
