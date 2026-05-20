import { IsArray, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEvidenciaDto } from './create-evidencia.dto';

export class CerrarOrdenDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEvidenciaDto)
  evidencias: CreateEvidenciaDto[];
}
