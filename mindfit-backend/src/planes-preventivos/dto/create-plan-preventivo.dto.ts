import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlanPreventivoDto {
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  activoId: number;

  @IsInt()
  @Min(1)
  intervaloDias: number;

  @IsDateString()
  proximaFechaEjecucion: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
