import { DataSource } from 'typeorm';
import { Cliente } from '../entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
export declare class ClientesService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private repo;
    findAll(): Promise<Cliente[]>;
    findOne(id: number): Promise<Cliente>;
    create(dto: CreateClienteDto): Promise<Cliente>;
    update(id: number, dto: UpdateClienteDto): Promise<Cliente>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
