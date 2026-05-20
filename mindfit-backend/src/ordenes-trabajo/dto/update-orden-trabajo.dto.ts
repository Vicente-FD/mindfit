import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ClasificacionOrden, PrioridadOrden } from '../../common/enums';

export class UpdateOrdenTrabajoDto {
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
  @IsEnum(ClasificacionOrden)
  clasificacion?: ClasificacionOrden;

  @ValidateIf(
    (o: UpdateOrdenTrabajoDto) =>
      o.clasificacion === ClasificacionOrden.MAQUINA,
  )
  @IsOptional()
  @IsInt()
  activoId?: number | null;

  @IsOptional()
  @IsInt()
  asignadoAId?: number | null;
}
