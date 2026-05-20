import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsObject,
} from 'class-validator';
import { RolUsuario } from '../../common/enums';
import type { PermisosUi } from '../../common/interfaces/permisos-ui.interface';

export class CreateUsuarioDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;

  @IsOptional()
  @IsInt()
  sucursalId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  estaActivo?: boolean;

  @IsOptional()
  @IsObject()
  permisosUi?: PermisosUi;
}
