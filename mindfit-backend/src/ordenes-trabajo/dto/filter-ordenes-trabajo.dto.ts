import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsDateString } from 'class-validator';

export class FilterOrdenesTrabajoDto {
  @IsOptional()
  @IsIn(['activas', 'por_aprobar', 'finalizadas'])
  estado?: 'activas' | 'por_aprobar' | 'finalizadas';

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sucursalId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tecnicoId?: number;
}
