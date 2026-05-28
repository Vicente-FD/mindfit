import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { SolicitudesPasswordService } from './solicitudes-password.service';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly solicitudesPasswordService: SolicitudesPasswordService,
  ) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get('recuperar/pendientes')
  @Roles(RolUsuario.ADMIN)
  listRecuperacionPendientes() {
    return this.solicitudesPasswordService.findPendientes();
  }

  @Patch('recuperar/aprobar/:solicitudId')
  @Roles(RolUsuario.ADMIN)
  aprobarRecuperacion(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.solicitudesPasswordService.aprobar(solicitudId, admin.sub);
  }

  @Patch('recuperar/rechazar/:solicitudId')
  @Roles(RolUsuario.ADMIN)
  rechazarRecuperacion(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.solicitudesPasswordService.rechazar(solicitudId, admin.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Patch(':id/password')
  updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usuariosService.updatePassword(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
