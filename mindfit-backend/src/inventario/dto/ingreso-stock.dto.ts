import { IsInt, Min } from 'class-validator';

export class IngresoStockDto {
  @IsInt()
  @Min(1)
  cantidad: number;
}
