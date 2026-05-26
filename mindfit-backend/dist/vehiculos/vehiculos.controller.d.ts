import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { VehiculosService } from './vehiculos.service';
export declare class VehiculosController {
    private readonly vehiculosService;
    constructor(vehiculosService: VehiculosService);
    findAlertas(): Promise<import("./vehiculos.service").VehiculoConAlertas[]>;
    findAll(): Promise<import("../entities").Vehiculo[]>;
    findOne(id: number): Promise<import("../entities").Vehiculo>;
    create(dto: CreateVehiculoDto): Promise<import("../entities").Vehiculo>;
    update(id: number, dto: UpdateVehiculoDto): Promise<import("../entities").Vehiculo>;
    remove(id: number): Promise<void>;
}
