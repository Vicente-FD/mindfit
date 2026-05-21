import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class RechazarOrdenDto {
  @ValidateIf((o: RechazarOrdenDto) => !o.motivo_rechazo)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  motivo?: string;

  @ValidateIf((o: RechazarOrdenDto) => !o.motivo)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  motivo_rechazo?: string;
}
