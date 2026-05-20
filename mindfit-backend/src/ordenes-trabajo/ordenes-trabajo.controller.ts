import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AsignarOrdenDto } from './dto/asignar-orden.dto';
import { CerrarOrdenDto } from './dto/cerrar-orden.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(private readonly ordenesService: OrdenesTrabajoService) {}

  @Get()
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.TECNICO,
    RolUsuario.JEFE_SUCURSAL,
    RolUsuario.GERENTE_BI,
  )
  findAll(
    @Query('tecnicoId') tecnicoId?: string,
    @Query('sucursalId') sucursalId?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const parsedTecnico =
      tecnicoId != null && tecnicoId !== ''
        ? parseInt(tecnicoId, 10)
        : user?.rol === RolUsuario.TECNICO
          ? user.id
          : undefined;
    const parsedSucursal =
      sucursalId != null && sucursalId !== ''
        ? parseInt(sucursalId, 10)
        : undefined;

    return this.ordenesService.findAll({
      tecnicoId: parsedTecnico,
      sucursalId: parsedSucursal,
    });
  }

  @Get('mis-asignadas')
  @Roles(RolUsuario.TECNICO)
  findMisAsignadas(@CurrentUser() user: JwtPayload) {
    return this.ordenesService.findAll({ tecnicoId: user.id });
  }

  @Get(':id')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.TECNICO,
    RolUsuario.JEFE_SUCURSAL,
    RolUsuario.GERENTE_BI,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordenesService.findOne(id);
  }

  @Post()
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.JEFE_SUCURSAL,
  )
  create(
    @Body() dto: CreateOrdenTrabajoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordenesService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrdenTrabajoDto,
  ) {
    return this.ordenesService.update(id, dto);
  }

  @Patch(':id/asignar')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarOrdenDto,
  ) {
    return this.ordenesService.asignar(id, dto);
  }

  @Patch(':id/iniciar')
  @Roles(RolUsuario.TECNICO)
  iniciar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordenesService.iniciar(id, user.id);
  }

  @Post(':id/comentarios')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.TECNICO,
    RolUsuario.JEFE_SUCURSAL,
  )
  agregarComentario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateComentarioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordenesService.agregarComentario(id, user.id, dto);
  }

  @Post(':id/evidencias')
  @Roles(RolUsuario.TECNICO)
  agregarEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEvidenciaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordenesService.agregarEvidencia(id, user.id, dto);
  }

  @Post(':id/cerrar')
  @Roles(RolUsuario.TECNICO)
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CerrarOrdenDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordenesService.cerrar(id, user.id, dto);
  }

  @Patch(':id/aprobar')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.ordenesService.aprobar(id);
  }
}
