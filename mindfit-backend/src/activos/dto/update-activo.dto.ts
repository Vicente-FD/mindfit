import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoOperacionalActivo } from '../../common/enums';

/** Campos editables del activo (no incluye códigos QR ni UUID). */
export class UpdateActivoDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsInt()
  marcaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroSerie?: string;

  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsInt()
  sucursalId?: number | null;

  @IsOptional()
  @IsInt()
  pisoAsignado?: number | null;

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

  @IsOptional()
  @IsBoolean()
  aptoParaVenta?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioVentaClp?: number;
}
