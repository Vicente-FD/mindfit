import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoriaActivo } from '../../common/enums';

export class AnalyticsFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sucursalId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tecnicoId?: number;

  @IsOptional()
  @IsEnum(CategoriaActivo)
  categoria?: CategoriaActivo;
}
