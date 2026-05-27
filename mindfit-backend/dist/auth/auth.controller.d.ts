import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { SolicitarRecuperacionDto } from './dto/solicitar-recuperacion.dto';
import { CambiarPasswordPerfilDto } from './dto/cambiar-password-perfil.dto';
import { SolicitudesPasswordService } from '../usuarios/solicitudes-password.service';
export declare class AuthController {
    private readonly authService;
    private readonly solicitudesPasswordService;
    constructor(authService: AuthService, solicitudesPasswordService: SolicitudesPasswordService);
    login(dto: LoginDto): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    solicitarRecuperacion(dto: SolicitarRecuperacionDto): Promise<import("../usuarios/solicitudes-password.service").SolicitarRecuperacionResponseDto>;
    cambiarPasswordPerfil(user: JwtPayload, dto: CambiarPasswordPerfilDto): Promise<import("./dto/cambiar-password-perfil-response.dto").CambiarPasswordPerfilResponseDto>;
    getMe(user: JwtPayload): Promise<import("./dto/auth-response.dto").SessionProfileDto>;
    logout(user: JwtPayload): Promise<{
        ok: true;
    }>;
    updateSesion(user: JwtPayload, dto: UpdateSesionDto): Promise<import("./dto/auth-response.dto").SessionProfileDto>;
}
