import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
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
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';
import { ReportarFallaDto } from './dto/reportar-falla.dto';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import {
  buildPublicFileUrl,
  evidenciasMulterStorage,
} from './storage/evidencias.storage';

@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(
    private readonly ordenesService: OrdenesTrabajoService,
    private readonly configService: ConfigService,
  ) {}

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

  @Get('mi-sucursal')
  @Roles(RolUsuario.JEFE_SUCURSAL)
  findMiSucursal(@CurrentUser() user: JwtPayload) {
    if (!user.sucursalId) {
      throw new BadRequestException('Usuario sin sucursal asignada');
    }
    return this.ordenesService.findBySucursal(user.sucursalId);
  }

  @Post('reportar-falla')
  @Roles(RolUsuario.JEFE_SUCURSAL)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'foto_falla', maxCount: 1 }], {
      storage: evidenciasMulterStorage,
    }),
  )
  reportarFalla(
    @UploadedFiles()
    files: { foto_falla?: Express.Multer.File[] },
    @Body() dto: ReportarFallaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user.sucursalId) {
      throw new BadRequestException('Usuario sin sucursal asignada');
    }
    const foto = files.foto_falla?.[0];
    const port = this.configService.get<number>('PORT', 3000);
    const fotoUrl = foto
      ? buildPublicFileUrl(foto.filename, port)
      : undefined;

    return this.ordenesService.reportarFalla(
      {
        activoId: Number(dto.activoId),
        descripcion: dto.descripcion,
        prioridad: dto.prioridad,
        titulo: dto.titulo,
      },
      user.id,
      user.sucursalId,
      fotoUrl,
    );
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

  @Patch(':id/estado')
  @Roles(RolUsuario.TECNICO)
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoOrdenDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordenesService.updateEstado(id, dto.estado, user.id);
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'fotos_antes', maxCount: 1 },
        { name: 'fotos_despues', maxCount: 1 },
      ],
      { storage: evidenciasMulterStorage },
    ),
  )
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      fotos_antes?: Express.Multer.File[];
      fotos_despues?: Express.Multer.File[];
    },
    @Body('comentario') comentario: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const fotoAntes = files.fotos_antes?.[0];
    const fotoDespues = files.fotos_despues?.[0];

    if (!comentario?.trim()) {
      throw new BadRequestException('El comentario es obligatorio');
    }
    if (!fotoAntes || !fotoDespues) {
      throw new BadRequestException(
        'Debe adjuntar fotos_antes y fotos_despues',
      );
    }

    const port = this.configService.get<number>('PORT', 3000);
    const urlAntes = buildPublicFileUrl(fotoAntes.filename, port);
    const urlDespues = buildPublicFileUrl(fotoDespues.filename, port);

    return this.ordenesService.cerrarConArchivos(
      id,
      user.id,
      comentario.trim(),
      urlAntes,
      urlDespues,
    );
  }

  @Post(':id/cerrar-json')
  @Roles(RolUsuario.TECNICO)
  cerrarJson(
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
