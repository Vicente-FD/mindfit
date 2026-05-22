import { IsIn, IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoRendicionGasto } from '../../common/enums/estado-rendicion-gasto.enum';

export class FilterListaGastosDto {
  /** Formato YYYY-MM; por defecto mes calendario actual */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  mes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tecnicoId?: number;

  @IsOptional()
  @IsIn([
    EstadoRendicionGasto.PENDIENTE,
    EstadoRendicionGasto.APROBADO,
    EstadoRendicionGasto.RECHAZADO,
  ])
  estado?: EstadoRendicionGasto;
}
