export interface Vehiculo {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometrajeActual: number;
  siguienteCambioAceiteKm: number;
  sucursalId: number | null;
  conductorId: number | null;
  vencimientoSoap: string;
  vencimientoPermiso: string;
  vencimientoRevision: string;
  documentosUrls?: Record<string, string> | null;
  sucursal?: { id: number; nombre: string; sigla?: string } | null;
  conductor?: { id: number; nombre: string; email?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehiculoAlertas {
  soap: boolean;
  permiso: boolean;
  revision: boolean;
  aceite: boolean;
}

export type VehiculoConAlertas = Vehiculo & { alertas: VehiculoAlertas };

export interface CreateVehiculoPayload {
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

export type UpdateVehiculoPayload = Partial<CreateVehiculoPayload>;

export interface LicenciaPanelRow {
  tecnicoId: number;
  tecnicoNombre: string;
  tecnicoEmail: string;
  licenciaId: number | null;
  tipoLicencia: string | null;
  fechaVencimiento: string | null;
  documentoUrl: string | null;
  diasRestantes: number | null;
}

export interface LicenciaTecnico {
  id: number;
  tecnicoId: number;
  tipoLicencia: string;
  fechaVencimiento: string;
  documentoUrl: string | null;
  tecnico?: { id: number; nombre: string; email: string };
}

export interface CreateLicenciaPayload {
  tecnicoId: number;
  tipoLicencia: string;
  fechaVencimiento: string;
}

export type EstadoVencimiento = 'ok' | 'warning' | 'danger' | 'none';

export const DIAS_ALERTA_FLOTA = 30;
export const KM_ALERTA_ACEITE = 1000;
