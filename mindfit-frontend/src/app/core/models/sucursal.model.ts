export interface Sucursal {
  id: number;
  nombre: string;
  sigla: string;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
  estaActiva?: boolean;
  activosOperativos?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSucursalPayload {
  nombre: string;
  sigla: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  estaActiva?: boolean;
}

export interface UpdateSucursalPayload {
  nombre?: string;
  sigla?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  estaActiva?: boolean;
}

export const CASA_CENTRAL_VALUE = 'casa_central';
