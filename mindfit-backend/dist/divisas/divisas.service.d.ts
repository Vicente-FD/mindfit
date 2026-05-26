import { DivisaCodigo } from '../common/enums';
export interface TasasDivisaDto {
    CLP: number;
    USD: number;
    EUR: number;
    CAD: number;
    fechaReferencia: string;
    fuente: string;
}
export declare class DivisasService {
    private readonly logger;
    private cache;
    private cacheAt;
    private readonly ttlMs;
    refrescarCacheDiario(): Promise<void>;
    getTasas(): Promise<TasasDivisaDto>;
    private fetchTasas;
    tasaParaDivisa(tasas: TasasDivisaDto, divisa: DivisaCodigo | string): number;
}
