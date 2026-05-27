import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { SolicitarRecuperacionDto } from './dto/solicitar-recuperacion.dto';
import { CambiarPasswordPerfilDto } from './dto/cambiar-password-perfil.dto';
import { SolicitudesPasswordService } from '../usuarios/solicitudes-password.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly solicitudesPasswordService: SolicitudesPasswordService,
  ) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('recuperar/solicitar')
  solicitarRecuperacion(@Body() dto: SolicitarRecuperacionDto) {
    return this.solicitudesPasswordService.solicitar(dto.email);
  }

  @Patch('mi-perfil/cambiar-password')
  cambiarPasswordPerfil(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CambiarPasswordPerfilDto,
  ) {
    return this.authService.cambiarPasswordPerfil(user.sub, dto);
  }

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getSessionProfile(user.sub);
  }

  @Post('logout')
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  @Patch('sesion')
  updateSesion(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateSesionDto,
  ) {
    return this.authService.updateSesion(user.sub, dto.estado);
  }
}
