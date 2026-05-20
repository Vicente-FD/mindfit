import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { EstadoOrdenTrabajo, RolUsuario } from '../common/enums';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AsignarOrdenDto } from './dto/asignar-orden.dto';
import { CerrarOrdenDto } from './dto/cerrar-orden.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';
import { ReportarFallaDto } from './dto/reportar-falla.dto';
import { FilterOrdenesTrabajoDto } from './dto/filter-ordenes-trabajo.dto';
import { RechazarOrdenDto } from './dto/rechazar-orden.dto';
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
    @Query() query: FilterOrdenesTrabajoDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    const parsedTecnico =
      query.tecnicoId != null
        ? query.tecnicoId
        : user?.rol === RolUsuario.TECNICO
          ? user.id
          : undefined;

    const needsComentarios =
      query.estado === 'finalizadas' ||
      query.estado === 'por_aprobar' ||
      !!(query.fecha_inicio || query.fecha_fin);

    const needsEvidencias =
      query.estado === 'finalizadas' || query.estado === 'por_aprobar';

    return this.ordenesService.findAll({
      tecnicoId: parsedTecnico,
      sucursalId: query.sucursalId,
      estado: query.estado,
      fechaInicio: query.fecha_inicio,
      fechaFin: query.fecha_fin,
      includeComentarios: needsComentarios,
      includeEvidencias: needsEvidencias,
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordenesService.remove(id);
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
  @UseInterceptors(
    FileInterceptor('foto_antes', { storage: evidenciasMulterStorage }),
  )
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('estado') estadoField: string | undefined,
    @Body() body: Record<string, string>,
    @CurrentUser() user: JwtPayload,
  ) {
    const estado = estadoField ?? body?.estado;
    if (estado !== EstadoOrdenTrabajo.EN_PROCESO) {
      throw new BadRequestException(
        'Solo se permite transición a en_proceso por este endpoint',
      );
    }
    if (!file) {
      throw new BadRequestException(
        'Debe adjuntar foto_antes para iniciar el trabajo',
      );
    }
    const port = this.configService.get<number>('PORT', 3000);
    const urlAntes = buildPublicFileUrl(file.filename, port);
    return this.ordenesService.updateEstado(
      id,
      EstadoOrdenTrabajo.EN_PROCESO,
      user.id,
      urlAntes,
    );
  }

  @Post(':id/iniciar-trabajo')
  @Roles(RolUsuario.TECNICO)
  @UseInterceptors(
    FileInterceptor('foto_antes', { storage: evidenciasMulterStorage }),
  )
  iniciarTrabajo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debe adjuntar foto_antes para iniciar el trabajo',
      );
    }
    const port = this.configService.get<number>('PORT', 3000);
    const urlAntes = buildPublicFileUrl(file.filename, port);
    return this.ordenesService.iniciarConEvidencia(id, user.id, urlAntes);
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
    FileInterceptor('foto_despues', { storage: evidenciasMulterStorage }),
  )
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() fotoDespues: Express.Multer.File | undefined,
    @Body('comentario') comentario: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!comentario?.trim()) {
      throw new BadRequestException('El comentario es obligatorio');
    }
    if (!fotoDespues) {
      throw new BadRequestException('Debe adjuntar foto_despues');
    }

    const port = this.configService.get<number>('PORT', 3000);
    const urlDespues = buildPublicFileUrl(fotoDespues.filename, port);

    return this.ordenesService.cerrarConArchivos(
      id,
      user.id,
      comentario.trim(),
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

  @Patch(':id/rechazar')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RechazarOrdenDto,
  ) {
    return this.ordenesService.rechazar(id, dto.motivo);
  }

  @Patch(':id/revertir-aprobacion')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  revertirAprobacion(@Param('id', ParseIntPipe) id: number) {
    return this.ordenesService.revertirAprobacion(id);
  }
}
