import { ActivosService } from './activos.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
export declare class ActivosController {
    private readonly activosService;
    constructor(activosService: ActivosService);
    findByUuid(uuidActivo: string): Promise<import("../entities").Activo>;
    findAll(sucursalId?: string): Promise<import("../entities").Activo[]>;
    findOne(id: number): Promise<import("../entities").Activo>;
    create(dto: CreateActivoDto): Promise<import("../entities").Activo>;
    update(id: number, dto: UpdateActivoDto): Promise<import("../entities").Activo>;
}
