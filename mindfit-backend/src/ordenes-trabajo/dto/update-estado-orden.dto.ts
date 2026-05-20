import { IsEnum } from 'class-validator';
import { EstadoOrdenTrabajo } from '../../common/enums';

export class UpdateEstadoOrdenDto {
  @IsEnum(EstadoOrdenTrabajo)
  estado: EstadoOrdenTrabajo;
}
