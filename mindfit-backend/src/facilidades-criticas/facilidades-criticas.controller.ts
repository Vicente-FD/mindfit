import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import {
  buildPublicFileUrl,
  evidenciasMulterStorage,
} from '../ordenes-trabajo/storage/evidencias.storage';
import { ActualizarEstadoFacilidadDto } from './dto/actualizar-estado-facilidad.dto';
import { ReportarAreaServiciosDto } from './dto/reportar-area-servicios.dto';
import { ReportarFallaFacilidadDto } from './dto/reportar-falla-facilidad.dto';
import { FacilidadesCriticasService } from './facilidades-criticas.service';

@Controller('facilidades-criticas')
export class FacilidadesCriticasController {
  constructor(
    private readonly facilidadesService: FacilidadesCriticasService,
    private readonly configService: ConfigService,
  ) {}

  @Get('mi-sucursal')
  @Roles(RolUsuario.JEFE_SUCURSAL)
  miSucursal(@CurrentUser() user: JwtPayload) {
    return this.facilidadesService.findMiSucursal(user);
  }

  @Get('resumen-sedes')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.GERENTE_BI,
  )
  resumenSedes() {
    return this.facilidadesService.getResumenGlobalSedes();
  }

  @Post('reportar-area-servicios')
  @Roles(RolUsuario.JEFE_SUCURSAL)
  @UseInterceptors(
    FileInterceptor('foto_falla', { storage: evidenciasMulterStorage }),
  )
  reportarAreaServicios(
    @UploadedFile() foto: Express.Multer.File,
    @Body() dto: ReportarAreaServiciosDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!foto) {
      throw new BadRequestException(
        'La fotografía del problema es obligatoria',
      );
    }
    const port = this.configService.get<number>('PORT', 3000);
    const fotoUrl = buildPublicFileUrl(foto.filename, port);
    return this.facilidadesService.reportarAreaServicios(dto, user, fotoUrl);
  }

  @Get('sucursal/:sucursalId')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.GERENTE_BI,
    RolUsuario.JEFE_SUCURSAL,
  )
  porSucursal(
    @Param('sucursalId', ParseIntPipe) sucursalId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facilidadesService.findBySucursalForUser(sucursalId, user);
  }

  @Get(':id/historial')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.GERENTE_BI,
    RolUsuario.JEFE_SUCURSAL,
  )
  historial(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facilidadesService.getHistorial(id, user);
  }

  @Patch(':id/reportar-falla')
  @Roles(
    RolUsuario.JEFE_SUCURSAL,
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
  )
  reportarFalla(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReportarFallaFacilidadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facilidadesService.reportarFalla(id, dto, user);
  }

  @Patch(':id/estado')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstadoFacilidadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facilidadesService.actualizarEstado(id, dto, user);
  }
}
