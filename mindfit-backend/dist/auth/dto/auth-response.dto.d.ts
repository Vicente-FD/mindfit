import { EstadoSesionUsuario, RolUsuario } from '../../common/enums';
import type { PermisosUi } from '../../common/interfaces/permisos-ui.interface';
export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: number;
        email: string;
        nombre: string;
        rol: RolUsuario;
        sucursalId: number | null;
        sucursalNombre: string | null;
        telefono: string | null;
        estadoSesion: EstadoSesionUsuario;
        permisosUi: PermisosUi;
        requiereCambioPassword: boolean;
    };
}
export declare class SessionProfileDto {
    user: AuthResponseDto['user'];
    forceLogout: boolean;
}
