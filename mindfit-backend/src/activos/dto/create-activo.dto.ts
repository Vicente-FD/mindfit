import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoOperacionalActivo } from '../../common/enums';

export class CreateActivoDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsInt()
  marcaId: number;

  @IsInt()
  categoriaId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroSerie?: string;

  /** Omitir o null = Bodega Central (sin QR hasta traslado a sucursal). */
  @IsOptional()
  @IsInt()
  sucursalId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
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

  /** Unidades idénticas a registrar; cada una recibe su propio código de inventario. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  cantidad?: number;
}
