import { Repository } from 'typeorm';
import { Marca } from '../entities/marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
export declare class MarcasService {
    private readonly marcaRepo;
    constructor(marcaRepo: Repository<Marca>);
    findAll(): Promise<Marca[]>;
    findOne(id: number): Promise<Marca>;
    create(dto: CreateMarcaDto): Promise<Marca>;
    update(id: number, dto: UpdateMarcaDto): Promise<Marca>;
}
