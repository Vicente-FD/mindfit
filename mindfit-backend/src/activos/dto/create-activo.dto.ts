import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import {
  CategoriaActivo,
  EstadoOperacionalActivo,
} from '../../common/enums';

export class CreateActivoDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  marca?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroSerie?: string;

  @IsEnum(CategoriaActivo)
  categoria: CategoriaActivo;

  @IsInt()
  sucursalId: number;

  @IsOptional()
  @IsDateString()
  fechaCompra?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimientoGarantia?: string;

  @IsOptional()
  @IsNumber()
  costoAdquisicion?: number;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  documentacionUrls?: string[];

  @IsOptional()
  @IsEnum(EstadoOperacionalActivo)
  estadoOperacional?: EstadoOperacionalActivo;
}
