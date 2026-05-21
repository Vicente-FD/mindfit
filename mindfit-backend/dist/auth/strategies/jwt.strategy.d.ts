import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usuarioRepository;
    constructor(configService: ConfigService, usuarioRepository: Repository<Usuario>);
    validate(payload: {
        sub: number;
        email: string;
        tokenVersion?: number;
    }): Promise<JwtPayload>;
}
export {};
