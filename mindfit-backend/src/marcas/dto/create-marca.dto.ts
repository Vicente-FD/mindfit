import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMarcaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5)
  sigla: string;
}
