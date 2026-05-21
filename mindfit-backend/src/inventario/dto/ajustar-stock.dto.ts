import { IsInt, Min } from 'class-validator';

export class AjustarStockDto {
  @IsInt()
  @Min(0)
  cantidadActual: number;
}
