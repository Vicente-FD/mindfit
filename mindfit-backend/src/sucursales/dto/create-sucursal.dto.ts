import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';
import type { CapacidadesServicios } from '../../common/types/capacidades-servicios.types';

const SIGLA_REGEX = /^[A-Z]{2,3}$/;

export class CreateSucursalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(SIGLA_REGEX, {
    message: 'La sigla debe tener 2 o 3 letras mayúsculas (sin números ni símbolos)',
  })
  sigla: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  comuna: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ciudad: string;

  @IsOptional()
  @IsBoolean()
  estaActiva?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  cantidadPisos?: number;

  @IsOptional()
  @IsObject()
  capacidadesServicios?: CapacidadesServicios;
}
