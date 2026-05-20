import { RolUsuario } from '../../common/enums';
export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: number;
        email: string;
        nombre: string;
        rol: RolUsuario;
        sucursalId: number | null;
    };
}
