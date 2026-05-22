import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { BulkOrdenTrabajoItemDto } from './bulk-orden-trabajo-item.dto';

export class BulkCreateOrdenesTrabajoDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkOrdenTrabajoItemDto)
  tasks: BulkOrdenTrabajoItemDto[];
}
