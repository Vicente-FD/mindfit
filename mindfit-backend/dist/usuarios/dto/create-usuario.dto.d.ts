import { RolUsuario } from '../../common/enums';
export declare class CreateUsuarioDto {
    email: string;
    password: string;
    nombre: string;
    rol: RolUsuario;
    sucursalId?: number;
    telefono?: string;
    estaActivo?: boolean;
}
