import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { EstadoSesionUsuario } from '../common/enums';
import {
  PERMISOS_BY_ROL,
  PERMISOS_UI_DEFAULT,
  PermisosUi,
} from '../common/interfaces/permisos-ui.interface';
import { Usuario } from '../entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, SessionProfileDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: { sucursal: true },
    });

    if (!usuario || !usuario.estaActivo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    usuario.estadoSesion = EstadoSesionUsuario.CONECTADO;
    await this.usuarioRepository.save(usuario);

    return {
      accessToken: await this.signToken(usuario),
      user: this.toAuthUser(usuario),
    };
  }

  async getSessionProfile(userId: number): Promise<SessionProfileDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
      relations: { sucursal: true },
    });
    if (!usuario || !usuario.estaActivo) {
      throw new UnauthorizedException('Sesión finalizada');
    }
    return {
      user: this.toAuthUser(usuario),
      forceLogout: false,
    };
  }

  async logout(userId: number): Promise<{ ok: true }> {
    await this.setEstadoSesion(userId, EstadoSesionUsuario.DESCONECTADO);
    return { ok: true };
  }

  async updateSesion(
    userId: number,
    estado: EstadoSesionUsuario,
  ): Promise<SessionProfileDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
      relations: { sucursal: true },
    });
    if (!usuario || !usuario.estaActivo) {
      throw new UnauthorizedException('Sesión finalizada');
    }
    usuario.estadoSesion = estado;
    await this.usuarioRepository.save(usuario);
    return {
      user: this.toAuthUser(usuario),
      forceLogout: false,
    };
  }

  async invalidateTokens(userId: number): Promise<void> {
    await this.usuarioRepository.increment({ id: userId }, 'tokenVersion', 1);
  }

  private async signToken(usuario: Usuario): Promise<string> {
    return this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      tokenVersion: usuario.tokenVersion ?? 0,
    });
  }

  private async setEstadoSesion(
    userId: number,
    estado: EstadoSesionUsuario,
  ): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
      relations: { sucursal: true },
    });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    usuario.estadoSesion = estado;
    return this.usuarioRepository.save(usuario);
  }

  private resolvePermisos(usuario: Usuario): PermisosUi {
    return {
      ...(PERMISOS_BY_ROL[usuario.rol] ?? PERMISOS_UI_DEFAULT),
      ...(usuario.permisosUi ?? {}),
    };
  }

  private toAuthUser(usuario: Usuario): AuthResponseDto['user'] {
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
      sucursalNombre: usuario.sucursal?.nombre ?? null,
      estadoSesion: usuario.estadoSesion,
      permisosUi: this.resolvePermisos(usuario),
    };
  }
}
