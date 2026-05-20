import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
export declare class MarcasController {
    private readonly marcasService;
    constructor(marcasService: MarcasService);
    findAll(): Promise<import("../entities").Marca[]>;
    findOne(id: number): Promise<import("../entities").Marca>;
    create(dto: CreateMarcaDto): Promise<import("../entities").Marca>;
    update(id: number, dto: UpdateMarcaDto): Promise<import("../entities").Marca>;
}
