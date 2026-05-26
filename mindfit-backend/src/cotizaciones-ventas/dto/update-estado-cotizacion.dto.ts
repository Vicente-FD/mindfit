import { IsEnum } from 'class-validator';
import { EstadoCotizacionVenta } from '../../common/enums';

export class UpdateEstadoCotizacionDto {
  @IsEnum(EstadoCotizacionVenta)
  estado: EstadoCotizacionVenta.APROBADA | EstadoCotizacionVenta.RECHAZADA;
}
