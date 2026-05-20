import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { EstadoSesionUsuario } from '../common/enums';
import { Usuario } from '../entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
export declare class AuthService {
    private readonly usuarioRepository;
    private readonly jwtService;
    constructor(usuarioRepository: Repository<Usuario>, jwtService: JwtService);
    login(dto: LoginDto): Promise<AuthResponseDto>;
    logout(userId: number): Promise<{
        ok: true;
    }>;
    updateSesion(userId: number, estado: EstadoSesionUsuario): Promise<{
        estadoSesion: EstadoSesionUsuario;
    }>;
    private setEstadoSesion;
    private toAuthUser;
}
