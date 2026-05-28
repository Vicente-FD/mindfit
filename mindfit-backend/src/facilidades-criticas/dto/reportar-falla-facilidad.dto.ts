import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportarFallaFacilidadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descripcionProblema: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notasTecnicas?: string;
}
