import { RolUsuario } from '../enums';
export declare class JwtPayload {
    sub: number;
    id: number;
    email: string;
    rol: RolUsuario;
    sucursalId: number | null;
    tokenVersion: number;
}
