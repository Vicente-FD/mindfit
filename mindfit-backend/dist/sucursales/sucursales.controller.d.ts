import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { SucursalesService } from './sucursales.service';
export declare class SucursalesController {
    private readonly sucursalesService;
    constructor(sucursalesService: SucursalesService);
    findAll(): Promise<import("./sucursales.service").SucursalListItem[]>;
    findOne(id: number): Promise<import("../entities").Sucursal>;
    create(dto: CreateSucursalDto): Promise<import("../entities").Sucursal>;
    update(id: number, dto: UpdateSucursalDto): Promise<import("../entities").Sucursal>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
}
