import { IsInt } from 'class-validator';

export class AsignarOrdenDto {
  @IsInt()
  tecnicoId: number;
}
