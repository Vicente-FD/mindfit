import { SessionProfileDto } from './auth-response.dto';

export class CambiarPasswordPerfilResponseDto extends SessionProfileDto {
  accessToken: string;
}
