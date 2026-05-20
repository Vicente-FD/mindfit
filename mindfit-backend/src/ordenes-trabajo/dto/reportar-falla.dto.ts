import { IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PrioridadOrden } from '../../common/enums';

export class ReportarFallaDto {
  @Type(() => Number)
  @IsInt()
  activoId: number;

  @IsString()
  @MinLength(10)
  descripcion: string;

  @IsEnum(PrioridadOrden)
  prioridad: PrioridadOrden;

  @IsOptional()
  @IsString()
  titulo?: string;
}
