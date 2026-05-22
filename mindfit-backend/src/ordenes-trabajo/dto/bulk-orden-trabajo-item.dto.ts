import { IsInt, IsOptional } from 'class-validator';
import { CreateOrdenTrabajoDto } from './create-orden-trabajo.dto';

export class BulkOrdenTrabajoItemDto extends CreateOrdenTrabajoDto {
  @IsOptional()
  @IsInt()
  asignadoAId?: number;
}
