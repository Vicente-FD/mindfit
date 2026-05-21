import { ActivosService } from './activos.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { FilterActivosDto } from './dto/filter-activos.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
export declare class ActivosController {
    private readonly activosService;
    constructor(activosService: ActivosService);
    getFichaPublica(uuidActivo: string): Promise<import("./dto/activo-ficha.dto").ActivoFichaDto>;
    findByUuid(uuidActivo: string): Promise<import("../entities").Activo>;
    findAll(filters: FilterActivosDto): Promise<import("../entities").Activo[]>;
    getHistorial(id: number): Promise<import("./dto/activo-historial.dto").ActivoHistorialItemDto[]>;
    findOne(id: number): Promise<import("../entities").Activo>;
    create(dto: CreateActivoDto): Promise<import("../entities").Activo>;
    update(id: number, dto: UpdateActivoDto): Promise<import("../entities").Activo>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
