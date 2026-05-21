import { DataSource } from 'typeorm';
import { OrdenesTrabajoService } from '../ordenes-trabajo/ordenes-trabajo.service';
export declare class CronSchedulerService {
    private readonly dataSource;
    private readonly ordenesService;
    private readonly logger;
    constructor(dataSource: DataSource, ordenesService: OrdenesTrabajoService);
    generarOrdenesPreventivas(): Promise<void>;
    private fechaHoyIso;
    private sumarDias;
    private resolverUsuarioSistema;
}
