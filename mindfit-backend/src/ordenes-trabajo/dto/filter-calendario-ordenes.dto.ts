import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterCalendarioOrdenesDto {
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mes debe tener formato YYYY-MM',
  })
  mes: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sucursalId?: number;
}
