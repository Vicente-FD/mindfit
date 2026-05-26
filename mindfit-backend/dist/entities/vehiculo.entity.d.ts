import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
export declare class Vehiculo {
    id: number;
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    kilometrajeActual: number;
    siguienteCambioAceiteKm: number;
    sucursalId: number | null;
    sucursal: Sucursal | null;
    conductorId: number | null;
    conductor: Usuario | null;
    vencimientoSoap: string;
    vencimientoPermiso: string;
    vencimientoRevision: string;
    documentosUrls: Record<string, string> | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
