import { InventarioService } from '../inventario/inventario.service';
import { ActivosService } from './activos.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { FilterActivosDto } from './dto/filter-activos.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
export declare class ActivosController {
    private readonly activosService;
    private readonly inventarioService;
    constructor(activosService: ActivosService, inventarioService: InventarioService);
    getFichaPublica(uuidActivo: string): Promise<import("./dto/activo-ficha.dto").ActivoFichaDto>;
    findByUuid(uuidActivo: string): Promise<import("../entities").Activo>;
    repuestosDisponiblesLegacy(): Promise<import("../inventario/inventario.service").RepuestoDisponibleDto[]>;
    findAll(filters: FilterActivosDto): Promise<import("../entities").Activo[]>;
    getHistorial(id: number): Promise<import("./dto/activo-historial.dto").ActivoHistorialItemDto[]>;
    findOne(id: number): Promise<import("../entities").Activo>;
    create(dto: CreateActivoDto): Promise<import("../entities").Activo>;
    update(id: number, dto: UpdateActivoDto): Promise<import("../entities").Activo>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
