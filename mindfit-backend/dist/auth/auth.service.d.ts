import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { EstadoSesionUsuario } from '../common/enums';
import { Usuario } from '../entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, SessionProfileDto } from './dto/auth-response.dto';
import { CambiarPasswordPerfilDto } from './dto/cambiar-password-perfil.dto';
import { CambiarPasswordPerfilResponseDto } from './dto/cambiar-password-perfil-response.dto';
export declare class AuthService {
    private readonly usuarioRepository;
    private readonly jwtService;
    private readonly dataSource;
    constructor(usuarioRepository: Repository<Usuario>, jwtService: JwtService, dataSource: DataSource);
    login(dto: LoginDto): Promise<AuthResponseDto>;
    getSessionProfile(userId: number): Promise<SessionProfileDto>;
    logout(userId: number): Promise<{
        ok: true;
    }>;
    updateSesion(userId: number, estado: EstadoSesionUsuario): Promise<SessionProfileDto>;
    invalidateTokens(userId: number): Promise<void>;
    cambiarPasswordPerfil(userId: number, dto: CambiarPasswordPerfilDto): Promise<CambiarPasswordPerfilResponseDto>;
    private signToken;
    private setEstadoSesion;
    private resolvePermisos;
    private toAuthUser;
}
