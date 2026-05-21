import { Repository } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Usuario } from '../entities/usuario.entity';
import { AnalyticsFiltersDto } from './dto/analytics-filters.dto';
export interface KpisResponse {
    efectividadPe: number;
    otsReportadas: number;
    otsResueltas: number;
    gastoAcumuladoMantenimiento: number;
    mttrHoras: number;
    mtbfHoras: number | null;
    fallasPorCategoria: {
        categoria: string;
        total: number;
    }[];
    otsPorSucursal: {
        sucursal: string;
        total: number;
    }[];
}
export declare class AnalyticsService {
    private readonly ordenRepo;
    private readonly activoRepo;
    private readonly usuarioRepo;
    constructor(ordenRepo: Repository<OrdenTrabajo>, activoRepo: Repository<Activo>, usuarioRepo: Repository<Usuario>);
    getKpis(filters: AnalyticsFiltersDto): Promise<KpisResponse>;
    listTecnicos(): Promise<Usuario[]>;
}
