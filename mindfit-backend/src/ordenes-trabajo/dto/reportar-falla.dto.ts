import {
  IsEnum,
  IsIn,
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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sucursalId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  asignadoAId?: number;

  @IsOptional()
  @IsIn(['bano', 'camarin', 'ducha'])
  areaServicios?: 'bano' | 'camarin' | 'ducha';

  @IsOptional()
  @IsString()
  generoServicios?: 'hombres' | 'mujeres' | string;

  /** CSV: hombres,mujeres */
  @IsOptional()
  @IsString()
  generosServicios?: string;

  /** multipart envía strings "true"/"false" */
  @IsOptional()
  @IsIn(['true', 'false', '1', '0'])
  fallaGeneralServicios?: string;

  /** JSON: [{ "tipo_elemento": "wc", "cantidad": 1 }] */
  @IsOptional()
  @IsString()
  elementosAfectados?: string;
}
