import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoFacilidadCritica } from '../../common/enums';

export class ActualizarEstadoFacilidadDto {
  @IsEnum(EstadoFacilidadCritica)
  estado: EstadoFacilidadCritica;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notasTecnicas?: string;
}
