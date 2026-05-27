import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const PASSWORD_POLICY =
  /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export class CambiarPasswordPerfilDto {
  @IsString()
  @IsNotEmpty()
  passwordActual: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  @Matches(PASSWORD_POLICY, {
    message:
      'La nueva contraseña debe incluir al menos una mayúscula y un número',
  })
  nuevoPassword: string;
}
