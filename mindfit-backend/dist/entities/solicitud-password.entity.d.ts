import { EstadoSolicitudPassword } from '../common/enums';
import { Usuario } from './usuario.entity';
export declare class SolicitudPassword {
    id: number;
    usuarioId: number;
    usuario: Usuario;
    estado: EstadoSolicitudPassword;
    contrasenaTemporalLegible: string | null;
    watchToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}
