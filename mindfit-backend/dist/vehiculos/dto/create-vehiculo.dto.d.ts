export declare class CreateVehiculoDto {
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    kilometrajeActual: number;
    siguienteCambioAceiteKm: number;
    sucursalId?: number | null;
    conductorId?: number | null;
    vencimientoSoap: string;
    vencimientoPermiso: string;
    vencimientoRevision: string;
    documentosUrls?: Record<string, string> | null;
}
