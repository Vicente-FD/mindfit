import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    findAll(): Promise<import("../entities").Usuario[]>;
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
