import { IsInt, IsOptional, ValidateIf } from 'class-validator';

export class TrasladoActivoDto {
  /** null = regresa a Bodega Central */
  @ValidateIf((o: TrasladoActivoDto) => o.nuevaSucursalId !== null)
  @IsOptional()
  @IsInt()
  nuevaSucursalId: number | null;
}
