import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { SolicitudesPasswordService } from './solicitudes-password.service';
import { UsuariosService } from './usuarios.service';
export declare class UsuariosController {
    private readonly usuariosService;
    private readonly solicitudesPasswordService;
    constructor(usuariosService: UsuariosService, solicitudesPasswordService: SolicitudesPasswordService);
    findAll(): Promise<import("../entities").Usuario[]>;
    listRecuperacionPendientes(): Promise<import("./solicitudes-password.service").SolicitudPasswordPendienteDto[]>;
    aprobarRecuperacion(solicitudId: number, admin: JwtPayload): Promise<import("./solicitudes-password.service").AprobarSolicitudPasswordResultDto>;
    findOne(id: number): Promise<import("../entities").Usuario>;
    create(dto: CreateUsuarioDto): Promise<import("../entities").Usuario>;
    update(id: number, dto: UpdateUsuarioDto): Promise<import("../entities").Usuario>;
    updatePassword(id: number, dto: UpdatePasswordDto): Promise<{
        updated: boolean;
    }>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
