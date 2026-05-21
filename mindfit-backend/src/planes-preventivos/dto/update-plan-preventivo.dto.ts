import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanPreventivoDto } from './create-plan-preventivo.dto';

export class UpdatePlanPreventivoDto extends PartialType(CreatePlanPreventivoDto) {}
