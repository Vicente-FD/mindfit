import { PermisosUi } from './permisos-ui.model';

export type UserRole =
  | 'admin'
  | 'jefe_operaciones'
  | 'tecnico'
  | 'jefe_sucursal'
  | 'gerente_bi'
  | 'bodeguero'
  | 'ejecutivo_ventas';

export type EstadoSesion = 'conectado' | 'desconectado' | 'reposo';

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  sucursalId: number | null;
  sucursalNombre?: string | null;
  telefono?: string | null;
  estadoSesion?: EstadoSesion;
  permisosUi: PermisosUi;
  requiereCambioPassword?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SessionProfileResponse {
  user: AuthUser;
  forceLogout: boolean;
}

export interface CambiarPasswordPerfilResponse extends SessionProfileResponse {
  accessToken: string;
}

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  jefe_operaciones: '/dashboard/jefe-operaciones',
  tecnico: '/dashboard/tecnico',
  jefe_sucursal: '/dashboard/sucursal',
  gerente_bi: '/dashboard/monitoreo',
  bodeguero: '/dashboard/bodeguero',
  ejecutivo_ventas: '/dashboard/ventas',
};
