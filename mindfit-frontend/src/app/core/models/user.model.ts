import { PermisosUi } from './permisos-ui.model';

export type UserRole =
  | 'admin'
  | 'jefe_operaciones'
  | 'tecnico'
  | 'jefe_sucursal'
  | 'gerente_bi'
  | 'bodeguero';

export type EstadoSesion = 'conectado' | 'desconectado' | 'reposo';

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  sucursalId: number | null;
  sucursalNombre?: string | null;
  estadoSesion?: EstadoSesion;
  permisosUi: PermisosUi;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SessionProfileResponse {
  user: AuthUser;
  forceLogout: boolean;
}

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  jefe_operaciones: '/dashboard/jefe-operaciones',
  tecnico: '/dashboard/tecnico',
  jefe_sucursal: '/dashboard/sucursal',
  gerente_bi: '/dashboard/gerente',
  bodeguero: '/dashboard/bodeguero',
};
