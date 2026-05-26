import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateLicenciaDto } from './create-licencia.dto';

export class UpdateLicenciaDto extends PartialType(
  OmitType(CreateLicenciaDto, ['tecnicoId'] as const),
) {}
