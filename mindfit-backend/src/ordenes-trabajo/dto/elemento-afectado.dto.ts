import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  TIPO_ELEMENTO_SERVICIO_VALUES,
  type TipoElementoServicio,
} from '../../common/types/capacidades-servicios.types';

export class ElementoAfectadoDto {
  @IsIn(TIPO_ELEMENTO_SERVICIO_VALUES)
  tipo_elemento: TipoElementoServicio;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class ServicioAfectadoDetalleDto {
  @IsIn([
    'bano_hombres',
    'bano_mujeres',
    'camarin_hombres',
    'camarin_mujeres',
    'duchas_hombres',
    'duchas_mujeres',
  ])
  tipoFacilidad: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElementoAfectadoDto)
  elementos: ElementoAfectadoDto[];
}
