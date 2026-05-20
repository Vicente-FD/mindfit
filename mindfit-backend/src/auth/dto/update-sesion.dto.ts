import { IsEnum } from 'class-validator';
import { EstadoSesionUsuario } from '../../common/enums';

export class UpdateSesionDto {
  @IsEnum(EstadoSesionUsuario)
  estado: EstadoSesionUsuario;
}
