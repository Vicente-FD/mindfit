import { RolUsuario } from '../../common/enums';
import type { PermisosUi } from '../../common/interfaces/permisos-ui.interface';
export declare class CreateUsuarioDto {
    email: string;
    password: string;
    nombre: string;
    rol: RolUsuario;
    sucursalId?: number;
    telefono?: string;
    estaActivo?: boolean;
    permisosUi?: PermisosUi;
}
