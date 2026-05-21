import { EstadoSesionUsuario, RolUsuario } from '../../common/enums';
import type { PermisosUi } from '../../common/interfaces/permisos-ui.interface';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: RolUsuario;
    sucursalId: number | null;
    sucursalNombre: string | null;
    estadoSesion: EstadoSesionUsuario;
    permisosUi: PermisosUi;
  };
}

export class SessionProfileDto {
  user: AuthResponseDto['user'];
  forceLogout: boolean;
}
