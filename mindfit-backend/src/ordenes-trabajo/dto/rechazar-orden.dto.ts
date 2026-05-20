import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RechazarOrdenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  motivo: string;
}
