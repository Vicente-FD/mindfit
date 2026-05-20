import { UserRole } from './user.model';

export interface PermisosUi {
  verDashboardEjecutivo?: boolean;
  verGestionActivos?: boolean;
  verGestionUsuarios?: boolean;
  verAsignacionOt?: boolean;
  verReportesSucursal?: boolean;
  generarQrActivos?: boolean;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  sucursalId: number | null;
  telefono: string | null;
  estaActivo: boolean;
  permisosUi?: PermisosUi;
  sucursal?: { id: number; nombre: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUsuarioPayload {
  email: string;
  password: string;
  nombre: string;
  rol: UserRole;
  sucursalId?: number;
  telefono?: string;
  estaActivo?: boolean;
  permisosUi?: PermisosUi;
}

export interface UpdateUsuarioPayload {
  email?: string;
  nombre?: string;
  rol?: UserRole;
  sucursalId?: number | null;
  telefono?: string | null;
  estaActivo?: boolean;
  permisosUi?: PermisosUi;
}
