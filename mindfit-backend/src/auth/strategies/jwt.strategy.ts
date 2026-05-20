import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  async validate(payload: { sub: number; email: string }): Promise<JwtPayload> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub, estaActivo: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }

    return {
      sub: usuario.id,
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
    };
  }
}
