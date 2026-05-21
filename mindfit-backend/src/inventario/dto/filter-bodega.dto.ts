import { IsOptional, IsString } from 'class-validator';

export class FilterBodegaDto {
  @IsOptional()
  @IsString()
  busqueda?: string;
}
