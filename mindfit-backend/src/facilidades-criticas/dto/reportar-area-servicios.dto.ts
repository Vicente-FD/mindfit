import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PrioridadOrden } from '../../common/enums';
import type { AreaFacilidad, GeneroFacilidad } from '../../common/utils/facilidades-criticas.util';

export const AREAS_FACILIDAD = ['bano', 'camarin', 'ducha'] as const;
export const GENEROS_FACILIDAD = ['hombres', 'mujeres'] as const;

export class ReportarAreaServiciosDto {
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  descripcionProblema: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notasTecnicas?: string;

  @IsOptional()
  @IsEnum(PrioridadOrden)
  prioridad?: PrioridadOrden;

  /** En multipart suele llegar como string "true" | "false". */
  @IsOptional()
  @IsIn(['true', 'false', '1', '0'])
  esFallaGeneral?: string;

  @ValidateIf(
    (o: ReportarAreaServiciosDto) =>
      !['true', '1'].includes(String(o.esFallaGeneral ?? '').toLowerCase()),
  )
  @IsIn(AREAS_FACILIDAD)
  area?: AreaFacilidad;

  @ValidateIf(
    (o: ReportarAreaServiciosDto) =>
      !['true', '1'].includes(String(o.esFallaGeneral ?? '').toLowerCase()),
  )
  @IsIn(GENEROS_FACILIDAD)
  genero?: GeneroFacilidad;
}
