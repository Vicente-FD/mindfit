import {
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CotizacionDetalleItemDto {
  @ValidateIf((o: CotizacionDetalleItemDto) => o.repuestoId == null)
  @Type(() => Number)
  @IsInt()
  activoId?: number;

  @ValidateIf((o: CotizacionDetalleItemDto) => o.activoId == null)
  @Type(() => Number)
  @IsInt()
  repuestoId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioUnitarioPactado: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalLineaNeto?: number;
}
