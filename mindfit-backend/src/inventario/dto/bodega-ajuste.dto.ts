import { IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';
import { TipoMovimientoInventario } from '../../common/enums';

export class BodegaAjusteDto {
  @IsInt()
  sucursalId: number;

  @IsInt()
  repuestoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsEnum(TipoMovimientoInventario)
  tipoMovimiento: TipoMovimientoInventario;

  @IsString()
  @MinLength(3)
  motivo: string;
}
