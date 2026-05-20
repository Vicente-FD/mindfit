import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';
export declare class SeedService implements OnModuleInit {
    private readonly sucursalRepo;
    private readonly usuarioRepo;
    private readonly logger;
    constructor(sucursalRepo: Repository<Sucursal>, usuarioRepo: Repository<Usuario>);
    onModuleInit(): Promise<void>;
}
