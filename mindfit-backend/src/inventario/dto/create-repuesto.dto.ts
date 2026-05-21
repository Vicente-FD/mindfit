import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRepuestoDto {
  @IsString()
  @MaxLength(50)
  sku: string;

  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costoUnitario: number;
}
