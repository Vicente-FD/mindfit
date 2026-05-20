import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoriaActivo } from '../../common/enums';

export class FilterActivosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sucursalId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  marcaId?: number;

  @IsOptional()
  @IsEnum(CategoriaActivo)
  categoria?: CategoriaActivo;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  anioCompra?: number;

  @IsOptional()
  @IsString()
  busqueda?: string;
}
