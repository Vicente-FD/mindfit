import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSucursalDto {
  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @MaxLength(5)
  sigla: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  comuna?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @IsOptional()
  @IsBoolean()
  estaActiva?: boolean;
}
