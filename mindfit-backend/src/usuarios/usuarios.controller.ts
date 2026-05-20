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
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
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
