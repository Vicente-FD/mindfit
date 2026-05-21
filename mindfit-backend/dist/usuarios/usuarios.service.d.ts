import { DataSource } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UsuariosService {
    private readonly dataSource;
    private readonly transactionContext;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService);
    private invalidateTokens;
    private repo;
    findAll(): Promise<Usuario[]>;
    findOne(id: number): Promise<Usuario>;
    create(dto: CreateUsuarioDto): Promise<Usuario>;
    update(id: number, dto: UpdateUsuarioDto): Promise<Usuario>;
    updatePassword(id: number, dto: UpdatePasswordDto): Promise<{
        updated: boolean;
    }>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
