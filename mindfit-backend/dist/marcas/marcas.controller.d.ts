import { ConfigService } from '@nestjs/config';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
export declare class MarcasController {
    private readonly marcasService;
    private readonly configService;
    constructor(marcasService: MarcasService, configService: ConfigService);
    findAll(): Promise<import("../entities").Marca[]>;
    findOne(id: number): Promise<import("../entities").Marca>;
    create(dto: CreateMarcaDto, file?: Express.Multer.File): Promise<import("../entities").Marca>;
    update(id: number, dto: UpdateMarcaDto, file?: Express.Multer.File): Promise<import("../entities").Marca>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
