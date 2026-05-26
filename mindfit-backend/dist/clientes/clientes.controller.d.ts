import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
export declare class ClientesController {
    private readonly clientesService;
    constructor(clientesService: ClientesService);
    findAll(): Promise<import("../entities").Cliente[]>;
    findOne(id: number): Promise<import("../entities").Cliente>;
    create(dto: CreateClienteDto): Promise<import("../entities").Cliente>;
    update(id: number, dto: UpdateClienteDto): Promise<import("../entities").Cliente>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
