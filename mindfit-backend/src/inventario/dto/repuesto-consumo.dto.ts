import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class RepuestoConsumoItemDto {
  @IsInt()
  repuestoId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class RepuestosConsumoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepuestoConsumoItemDto)
  repuestos: RepuestoConsumoItemDto[];
}
