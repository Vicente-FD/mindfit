import { IsEnum, IsUrl } from 'class-validator';
import { TipoEvidencia } from '../../common/enums';

export class CreateEvidenciaDto {
  @IsEnum(TipoEvidencia)
  tipoEvidencia: TipoEvidencia;

  @IsUrl()
  urlImagen: string;
}
