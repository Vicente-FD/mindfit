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
import { BulkCreateOrdenesTrabajoDto } from './dto/bulk-create-ordenes-trabajo.dto';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';
import { ReportarFallaDto } from './dto/reportar-falla.dto';
import { FilterOrdenesTrabajoDto } from './dto/filter-ordenes-trabajo.dto';
import { FilterCalendarioOrdenesDto } from './dto/filter-calendario-ordenes.dto';
import { RechazarOrdenDto } from './dto/rechazar-orden.dto';
import { parseElementosAfectadosJson } from '../common/utils/operatividad-servicios.util';
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
      query.estado === 'activas' ||
      query.estado === 'finalizadas' ||
      query.estado === 'por_aprobar' ||
      !!(query.fecha_inicio || query.fecha_fin);

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
  @Roles(
    RolUsuario.JEFE_SUCURSAL,
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
  )
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
    const sucursalId = user.sucursalId ?? dto.sucursalId;
    if (sucursalId == null) {
      throw new BadRequestException(
        'Debe indicar la sucursal del reporte',
      );
    }

    const tipoReporte = dto.tipoReporte ?? 'maquina';
    const foto = files.foto_falla?.[0];
    const generoSingle =
      dto.generoServicios === 'hombres' || dto.generoServicios === 'mujeres'
        ? dto.generoServicios
        : undefined;
    const esReporteServicios =
      tipoReporte === 'infraestructura' &&
      (!!dto.areaServicios ||
        ['true', '1'].includes(
          String(dto.fallaGeneralServicios ?? '').toLowerCase(),
        ));

    if (tipoReporte === 'maquina') {
      if (dto.activoId == null || Number.isNaN(Number(dto.activoId))) {
        throw new BadRequestException(
          'Debe indicar el activo para reportes de máquina',
        );
      }
      const fotoObligatoria = user.rol === RolUsuario.JEFE_SUCURSAL;
      if (fotoObligatoria && !foto) {
        throw new BadRequestException(
          'La foto de la falla es obligatoria para equipos',
        );
      }
    }

    if (esReporteServicios && !foto) {
      throw new BadRequestException(
        'La foto de la falla es obligatoria para área de servicios',
      );
    }
    if (
      esReporteServicios &&
      !['true', '1'].includes(
        String(dto.fallaGeneralServicios ?? '').toLowerCase(),
      ) &&
      (!dto.areaServicios || !(dto.generosServicios || dto.generoServicios))
    ) {
      throw new BadRequestException(
        'Debe seleccionar área y género o marcar falla general de servicios',
      );
    }

    const port = this.configService.get<number>('PORT', 3000);
    const fotoUrl = foto
      ? buildPublicFileUrl(foto.filename, port)
      : undefined;

    return this.ordenesService.reportarFalla(
      {
        tipoReporte,
        activoId:
          tipoReporte === 'maquina' ? Number(dto.activoId) : null,
        descripcion: dto.descripcion,
        prioridad: dto.prioridad,
        titulo: dto.titulo,
        asignadoAId: dto.asignadoAId,
        areaServicios: dto.areaServicios,
        generoServicios: generoSingle,
        generosServicios: dto.generosServicios,
        fallaGeneralServicios:
          String(dto.fallaGeneralServicios ?? '').toLowerCase(),
        elementosAfectados: parseElementosAfectadosJson(
          dto.elementosAfectados,
        ),
      },
      user.id,
      sucursalId,
      fotoUrl,
    );
  }

  @Get('calendario')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.GERENTE_BI,
  )
  findCalendario(@Query() query: FilterCalendarioOrdenesDto) {
    return this.ordenesService.findCalendario(query.mes, query.sucursalId);
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

  @Post('bulk')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  createBulk(
    @Body() dto: BulkCreateOrdenesTrabajoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordenesService.createBulk(dto.tasks, user.id);
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
    @Body('repuestos') repuestosJson: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!comentario?.trim()) {
      throw new BadRequestException('El comentario es obligatorio');
    }
    if (!fotoDespues) {
      throw new BadRequestException('Debe adjuntar foto_despues');
    }

    const repuestos = this.parseRepuestosJson(repuestosJson);

    const port = this.configService.get<number>('PORT', 3000);
    const urlDespues = buildPublicFileUrl(fotoDespues.filename, port);

    return this.ordenesService.cerrarConArchivos(
      id,
      user.id,
      comentario.trim(),
      urlDespues,
      repuestos,
    );
  }

  private parseRepuestosJson(
    raw: string | undefined,
  ): { repuestoId: number; cantidad: number }[] {
    if (!raw?.trim()) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (x): x is { repuestoId: number; cantidad: number } =>
            x != null &&
            typeof x === 'object' &&
            Number.isFinite(Number((x as { repuestoId: unknown }).repuestoId)) &&
            Number.isFinite(Number((x as { cantidad: unknown }).cantidad)) &&
            Number((x as { cantidad: number }).cantidad) > 0,
        )
        .map((x) => ({
          repuestoId: Number(x.repuestoId),
          cantidad: Number(x.cantidad),
        }));
    } catch {
      throw new BadRequestException('Formato inválido en repuestos');
    }
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
    const motivo = dto.motivo ?? dto.motivo_rechazo ?? '';
    return this.ordenesService.rechazar(
      id,
      motivo,
      dto.actualizarServiciosOperativo === true,
    );
  }

  @Patch(':id/revertir-aprobacion')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  revertirAprobacion(@Param('id', ParseIntPipe) id: number) {
    return this.ordenesService.revertirAprobacion(id);
  }
}
