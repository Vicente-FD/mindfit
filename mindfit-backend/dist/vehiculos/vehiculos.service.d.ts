import { DataSource } from 'typeorm';
import { Vehiculo } from '../entities/vehiculo.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { AlertasVehiculo } from './flota-alertas.util';
export type VehiculoConAlertas = Vehiculo & {
    alertas: AlertasVehiculo;
};
export declare class VehiculosService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private repo;
    findAll(): Promise<Vehiculo[]>;
    findAlertas(): Promise<VehiculoConAlertas[]>;
    findOne(id: number): Promise<Vehiculo>;
    create(dto: CreateVehiculoDto): Promise<Vehiculo>;
    update(id: number, dto: UpdateVehiculoDto): Promise<Vehiculo>;
    remove(id: number): Promise<void>;
    private mapDto;
}
