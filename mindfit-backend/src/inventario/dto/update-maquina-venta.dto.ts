import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateMaquinaVentaDto {
  @IsBoolean()
  aptoParaVenta: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioVentaClp?: number;
}
