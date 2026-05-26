import { Transform } from 'class-transformer';
import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateLicenciaDto {
  @Transform(({ value }) => {
    const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    return Number.isFinite(n) ? n : value;
  })
  @IsInt()
  tecnicoId: number;

  @IsString()
  @MaxLength(30)
  tipoLicencia: string;

  @IsString()
  fechaVencimiento: string;
}
