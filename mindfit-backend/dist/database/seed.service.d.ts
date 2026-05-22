import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Marca } from '../entities/marca.entity';
import { Categoria } from '../entities/categoria.entity';
import { Repuesto } from '../entities/repuesto.entity';
import { BodegaStock } from '../entities/bodega-stock.entity';
export declare class SeedService implements OnModuleInit {
    private readonly sucursalRepo;
    private readonly usuarioRepo;
    private readonly activoRepo;
    private readonly ordenRepo;
    private readonly marcaRepo;
    private readonly categoriaRepo;
    private readonly repuestoRepo;
    private readonly bodegaStockRepo;
    private readonly logger;
    constructor(sucursalRepo: Repository<Sucursal>, usuarioRepo: Repository<Usuario>, activoRepo: Repository<Activo>, ordenRepo: Repository<OrdenTrabajo>, marcaRepo: Repository<Marca>, categoriaRepo: Repository<Categoria>, repuestoRepo: Repository<Repuesto>, bodegaStockRepo: Repository<BodegaStock>);
    onModuleInit(): Promise<void>;
    private seedInventario;
    private seedMarcas;
    private upsertSucursal;
}
