import { IsInt } from 'class-validator';

export class AsignarOrdenDto {
  @IsInt()
  asignadoAId: number;
}
