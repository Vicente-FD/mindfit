import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
export declare class SeedService implements OnModuleInit {
    private readonly sucursalRepo;
    private readonly usuarioRepo;
    private readonly activoRepo;
    private readonly ordenRepo;
    private readonly logger;
    constructor(sucursalRepo: Repository<Sucursal>, usuarioRepo: Repository<Usuario>, activoRepo: Repository<Activo>, ordenRepo: Repository<OrdenTrabajo>);
    onModuleInit(): Promise<void>;
    private upsertSucursal;
}
