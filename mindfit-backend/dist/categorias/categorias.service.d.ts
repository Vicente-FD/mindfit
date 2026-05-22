import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
export declare class CategoriasService {
    private readonly categoriaRepo;
    constructor(categoriaRepo: Repository<Categoria>);
    findAll(): Promise<Categoria[]>;
    findOne(id: number): Promise<Categoria>;
    create(dto: CreateCategoriaDto): Promise<Categoria>;
    update(id: number, dto: UpdateCategoriaDto): Promise<Categoria>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
