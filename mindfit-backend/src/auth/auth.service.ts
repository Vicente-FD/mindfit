import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
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

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        sucursalId: usuario.sucursalId,
      },
    };
  }
}
