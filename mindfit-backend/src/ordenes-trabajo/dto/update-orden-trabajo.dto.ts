import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  EstadoOrdenTrabajo,
  PrioridadOrden,
  TipoMantenimiento,
} from '../../common/enums';

export class UpdateOrdenTrabajoDto {
  @IsOptional()
  @IsInt()
  activoId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(PrioridadOrden)
  prioridad?: PrioridadOrden;

  @IsOptional()
  @IsEnum(TipoMantenimiento)
  tipoMantenimiento?: TipoMantenimiento;

  @IsOptional()
  @IsEnum(EstadoOrdenTrabajo)
  estado?: EstadoOrdenTrabajo;

  @IsOptional()
  @IsInt()
  tiempoEstimadoMinutos?: number;

  @IsOptional()
  @IsDateString()
  fechaProgramacion?: string;

  @IsOptional()
  @IsString()
  motivoRechazo?: string;
}
