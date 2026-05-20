import { RolUsuario } from '../enums';

export class JwtPayload {
  sub: number;
  id: number;
  email: string;
  rol: RolUsuario;
  sucursalId: number | null;
}
