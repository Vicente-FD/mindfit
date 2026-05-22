import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { EstadoRendicionGasto } from '../../common/enums/estado-rendicion-gasto.enum';

export class DecidirRendicionGastoDto {
  @IsIn([EstadoRendicionGasto.APROBADO, EstadoRendicionGasto.RECHAZADO])
  estado: EstadoRendicionGasto.APROBADO | EstadoRendicionGasto.RECHAZADO;

  @ValidateIf((o: DecidirRendicionGastoDto) => o.estado === EstadoRendicionGasto.RECHAZADO)
  @IsString()
  @MinLength(3)
  motivoRechazo?: string;

  @ValidateIf((o: DecidirRendicionGastoDto) => o.estado === EstadoRendicionGasto.APROBADO)
  @IsOptional()
  @IsString()
  motivoRechazoAprobacion?: string;
}
