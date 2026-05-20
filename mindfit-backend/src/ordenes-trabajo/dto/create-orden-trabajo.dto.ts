import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  ClasificacionOrden,
  PrioridadOrden,
  TipoMantenimiento,
} from '../../common/enums';

export class CreateOrdenTrabajoDto {
  @IsOptional()
  @IsEnum(ClasificacionOrden)
  clasificacion?: ClasificacionOrden;

  @ValidateIf(
    (o: CreateOrdenTrabajoDto) =>
      (o.clasificacion ?? ClasificacionOrden.MAQUINA) === ClasificacionOrden.MAQUINA,
  )
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
