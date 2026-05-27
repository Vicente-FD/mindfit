import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EtapaOportunidad } from '../../common/enums';
import {
  OportunidadActividadDto,
  OportunidadChecklistItemDto,
} from './oportunidad-crm.dto';

export class UpdateOportunidadDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  titulo?: string;

  @IsOptional()
  @IsEnum(EtapaOportunidad)
  etapa?: EtapaOportunidad;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  montoEstimado?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  divisaCodigo?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsDateString()
  fechaCierreEstimada?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OportunidadChecklistItemDto)
  checklist?: OportunidadChecklistItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OportunidadActividadDto)
  actividades?: OportunidadActividadDto[];
}
