import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { EstadoRendicionGasto } from '../common/enums/estado-rendicion-gasto.enum';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateRendicionGastoDto } from './dto/create-rendicion-gasto.dto';
import { DecidirRendicionGastoDto } from './dto/decidir-rendicion-gasto.dto';
import { FilterListaGastosDto } from './dto/filter-lista-gastos.dto';
export declare const LIMITE_MENSUAL_GASTO = 100000;
export interface RendicionGastoDto {
    id: number;
    tecnicoId: number;
    tecnicoNombre: string;
    monto: number;
    descripcion: string;
    urlBoleta: string;
    estado: EstadoRendicionGasto;
    motivoRechazo: string | null;
    fechaGasto: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface SaldoTecnicoDto {
    tecnicoId: number;
    tecnicoNombre: string;
    tecnicoEmail: string;
    limiteMensual: number;
    montoAprobadoMes: number;
    saldoDisponible: number;
    porcentajeConsumido: number;
    alertaSaldoBajo: boolean;
}
export interface MiSaldoGastosDto {
    limiteMensual: number;
    montoAprobadoMes: number;
    saldoDisponible: number;
    historial: RendicionGastoDto[];
}
export interface AdminGastosDto {
    pendientes: RendicionGastoDto[];
    tecnicos: SaldoTecnicoDto[];
}
export interface GastosListaResumenDto {
    totalAprobado: number;
    totalPendiente: number;
    totalRechazado: number;
    totalGeneral: number;
    cantidad: number;
}
export interface ListaGastosDto {
    mes: string;
    desde: string;
    hasta: string;
    items: RendicionGastoDto[];
    resumen: GastosListaResumenDto;
}
export declare class RendicionesGastosService {
    private readonly dataSource;
    private readonly transactionContext;
    private readonly configService;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService, configService: ConfigService);
    private repo;
    private usuarioRepo;
    private boundsForMes;
    private monthBounds;
    findLista(filters: FilterListaGastosDto, options?: {
        tecnicoIdScope?: number;
    }): Promise<ListaGastosDto>;
    sumAprobadosMes(tecnicoId: number, mes?: string): Promise<number>;
    calcSaldoDisponible(tecnicoId: number): Promise<number>;
    create(tecnicoId: number, dto: CreateRendicionGastoDto, boletaFilename: string): Promise<RendicionGastoDto>;
    findMiSaldo(tecnicoId: number): Promise<MiSaldoGastosDto>;
    findAdminView(): Promise<AdminGastosDto>;
    decidir(id: number, dto: DecidirRendicionGastoDto): Promise<RendicionGastoDto>;
    private buildSaldoTecnico;
    private toDto;
}
