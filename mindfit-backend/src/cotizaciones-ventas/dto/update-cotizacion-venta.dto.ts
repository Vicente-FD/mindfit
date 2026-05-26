import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DivisaCodigo } from '../../common/enums';
import { CotizacionDetalleItemDto } from './cotizacion-detalle-item.dto';

export class UpdateCotizacionVentaDto {
  @IsOptional()
  @IsEnum(DivisaCodigo)
  divisaCodigo?: DivisaCodigo;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  tasaCambioClp?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotalNeto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  montoIva?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  montoBruto?: number;

  @IsOptional()
  @IsString()
  comentariosComerciales?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CotizacionDetalleItemDto)
  detalles?: CotizacionDetalleItemDto[];
}
