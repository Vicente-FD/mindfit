import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { EstadoSesionUsuario } from '../common/enums';
import { Usuario } from '../entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

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

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    usuario.estadoSesion = EstadoSesionUsuario.CONECTADO;
    await this.usuarioRepository.save(usuario);

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.toAuthUser(usuario),
    };
  }

  async logout(userId: number): Promise<{ ok: true }> {
    await this.setEstadoSesion(userId, EstadoSesionUsuario.DESCONECTADO);
    return { ok: true };
  }

  async updateSesion(
    userId: number,
    estado: EstadoSesionUsuario,
  ): Promise<{ estadoSesion: EstadoSesionUsuario }> {
    const usuario = await this.setEstadoSesion(userId, estado);
    return { estadoSesion: usuario.estadoSesion };
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

  private toAuthUser(usuario: Usuario) {
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
      sucursalNombre: usuario.sucursal?.nombre ?? null,
      estadoSesion: usuario.estadoSesion,
    };
  }
}
