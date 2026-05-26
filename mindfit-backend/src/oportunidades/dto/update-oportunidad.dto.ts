import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EtapaOportunidad } from '../../common/enums';

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
}
