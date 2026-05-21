import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PrioridadOrden } from '../../common/enums';
import {
  TIPOS_REPORTE_SUCURSAL,
  type TipoReporteSucursal,
} from './tipo-reporte-sucursal';

export class ReportarFallaDto {
  @IsOptional()
  @IsEnum(TIPOS_REPORTE_SUCURSAL)
  tipoReporte?: TipoReporteSucursal;

  @ValidateIf(
    (o: ReportarFallaDto) => (o.tipoReporte ?? 'maquina') === 'maquina',
  )
  @Type(() => Number)
  @IsInt()
  activoId?: number;

  @IsString()
  @MinLength(10)
  descripcion: string;

  @IsEnum(PrioridadOrden)
  prioridad: PrioridadOrden;

  @IsOptional()
  @IsString()
  titulo?: string;
}
