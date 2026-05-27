import { DataSource } from 'typeorm';
import { Oportunidad } from '../entities/oportunidad.entity';
import { ClientesService } from '../clientes/clientes.service';
import { CreateOportunidadDto } from './dto/create-oportunidad.dto';
import { UpdateOportunidadDto } from './dto/update-oportunidad.dto';
export declare class OportunidadesService {
    private readonly dataSource;
    private readonly clientesService;
    constructor(dataSource: DataSource, clientesService: ClientesService);
    private repo;
    findAll(): Promise<Oportunidad[]>;
    findOne(id: number): Promise<Oportunidad>;
    create(dto: CreateOportunidadDto, creadoPorId: number): Promise<Oportunidad>;
    update(id: number, dto: UpdateOportunidadDto): Promise<Oportunidad>;
    marcarGanada(id: number): Promise<Oportunidad>;
    private checklistDefault;
}
