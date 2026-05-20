import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PrioridadOrden, TipoMantenimiento } from '../../common/enums';

export class CreateOrdenTrabajoDto {
  @IsOptional()
  @IsInt()
  activoId?: number;

  @IsInt()
  sucursalId: number;

  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(PrioridadOrden)
  prioridad?: PrioridadOrden;

  @IsEnum(TipoMantenimiento)
  tipoMantenimiento: TipoMantenimiento;

  @IsOptional()
  @IsInt()
  tiempoEstimadoMinutos?: number;

  @IsOptional()
  @IsDateString()
  fechaProgramacion?: string;
}
