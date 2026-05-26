import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
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
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

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

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  soloBodegaCentral?: boolean;
}
