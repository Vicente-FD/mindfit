import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
export declare class CategoriasController {
    private readonly categoriasService;
    constructor(categoriasService: CategoriasService);
    findAll(): Promise<import("../entities").Categoria[]>;
    findOne(id: number): Promise<import("../entities").Categoria>;
    create(dto: CreateCategoriaDto): Promise<import("../entities").Categoria>;
    update(id: number, dto: UpdateCategoriaDto): Promise<import("../entities").Categoria>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
