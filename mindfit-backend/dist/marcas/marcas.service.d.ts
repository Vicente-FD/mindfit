import { Repository } from 'typeorm';
import { Marca } from '../entities/marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
export declare class MarcasService {
    private readonly marcaRepo;
    constructor(marcaRepo: Repository<Marca>);
    findAll(): Promise<Marca[]>;
    findOne(id: number): Promise<Marca>;
    create(dto: CreateMarcaDto, logoUrl?: string): Promise<Marca>;
    update(id: number, dto: UpdateMarcaDto, logoUrl?: string): Promise<Marca>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
