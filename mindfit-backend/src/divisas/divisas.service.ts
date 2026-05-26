import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DivisaCodigo } from '../common/enums';

export interface TasasDivisaDto {
  CLP: number;
  USD: number;
  EUR: number;
  CAD: number;
  fechaReferencia: string;
  fuente: string;
}

interface MindicadorSerie {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

interface MindicadorApiResponse {
  version?: string;
  fecha?: string;
  dolar?: MindicadorSerie;
  euro?: MindicadorSerie;
}

/** Paridad USD/CAD aproximada para derivar CLP por CAD desde el dólar observado. */
const USD_POR_CAD = 1.36;

@Injectable()
export class DivisasService {
  private readonly logger = new Logger(DivisasService.name);
  private cache: TasasDivisaDto | null = null;
  private cacheAt = 0;
  private readonly ttlMs = 12 * 60 * 60 * 1000;

  @Cron('0 8 * * *')
  async refrescarCacheDiario(): Promise<void> {
    try {
      await this.fetchTasas(true);
      this.logger.log('Tasas de cambio actualizadas (cron diario)');
    } catch (err) {
      this.logger.warn(`No se pudo refrescar tasas: ${String(err)}`);
    }
  }

  async getTasas(): Promise<TasasDivisaDto> {
    if (this.cache && Date.now() - this.cacheAt < this.ttlMs) {
      return this.cache;
    }
    return this.fetchTasas(false);
  }

  private async fetchTasas(force: boolean): Promise<TasasDivisaDto> {
    if (!force && this.cache && Date.now() - this.cacheAt < this.ttlMs) {
      return this.cache;
    }

    const res = await fetch('https://mindicador.cl/api', {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      if (this.cache) return this.cache;
      throw new Error(`mindicador.cl respondió ${res.status}`);
    }

    const data = (await res.json()) as MindicadorApiResponse;
    const usd = data.dolar?.valor;
    const eur = data.euro?.valor;

    if (usd == null || eur == null || !Number.isFinite(usd) || !Number.isFinite(eur)) {
      if (this.cache) return this.cache;
      throw new Error('Respuesta incompleta de mindicador.cl');
    }

    const cad = usd / USD_POR_CAD;

    const tasas: TasasDivisaDto = {
      CLP: 1,
      USD: usd,
      EUR: eur,
      CAD: Math.round(cad * 100) / 100,
      fechaReferencia: data.dolar?.fecha ?? data.fecha ?? new Date().toISOString(),
      fuente: 'mindicador.cl',
    };

    this.cache = tasas;
    this.cacheAt = Date.now();
    return tasas;
  }

  tasaParaDivisa(tasas: TasasDivisaDto, divisa: DivisaCodigo | string): number {
    switch (divisa) {
      case DivisaCodigo.USD:
        return tasas.USD;
      case DivisaCodigo.EUR:
        return tasas.EUR;
      case DivisaCodigo.CAD:
        return tasas.CAD;
      default:
        return 1;
    }
  }
}
