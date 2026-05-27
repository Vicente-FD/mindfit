import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class OportunidadChecklistItemDto {
  @IsString()
  @MaxLength(50)
  id: string;

  @IsString()
  @MaxLength(200)
  texto: string;

  @IsBoolean()
  completado: boolean;
}

export class OportunidadActividadDto {
  @IsString()
  @MaxLength(50)
  id: string;

  @IsString()
  @MaxLength(500)
  texto: string;

  @IsOptional()
  @IsString()
  createdAt?: string;
}
