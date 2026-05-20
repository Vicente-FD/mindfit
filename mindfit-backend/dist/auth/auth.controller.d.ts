import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    logout(user: JwtPayload): Promise<{
        ok: true;
    }>;
    updateSesion(user: JwtPayload, dto: UpdateSesionDto): Promise<{
        estadoSesion: import("../common/enums").EstadoSesionUsuario;
    }>;
}
