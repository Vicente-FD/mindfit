import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVehiculoDto {
  @IsString()
  @MaxLength(15)
  patente: string;

  @IsString()
  @MaxLength(100)
  marca: string;

  @IsString()
  @MaxLength(100)
  modelo: string;

  @IsInt()
  @Min(1900)
  anio: number;

  @IsInt()
  @Min(0)
  kilometrajeActual: number;

  @IsInt()
  @Min(0)
  siguienteCambioAceiteKm: number;

  @IsOptional()
  @IsInt()
  sucursalId?: number | null;

  @IsOptional()
  @IsInt()
  conductorId?: number | null;

  @IsString()
  vencimientoSoap: string;

  @IsString()
  vencimientoPermiso: string;

  @IsString()
  vencimientoRevision: string;

  @IsOptional()
  @IsObject()
  documentosUrls?: Record<string, string> | null;
}
