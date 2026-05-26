import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(15)
  rut: string;

  @IsString()
  @MaxLength(150)
  razonSocial: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsString()
  @MaxLength(200)
  direccion: string;

  @IsString()
  @MaxLength(100)
  comuna: string;

  @IsString()
  @MaxLength(100)
  ciudad: string;
}
