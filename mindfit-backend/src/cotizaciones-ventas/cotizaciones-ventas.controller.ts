import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLES_VENTAS_APROBACION, ROLES_VENTAS_ESCRITURA, ROLES_VENTAS_LECTURA } from '../common/constants/roles-ventas';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CotizacionesVentasService } from './cotizaciones-ventas.service';
import { CreateCotizacionVentaDto } from './dto/create-cotizacion-venta.dto';
import { UpdateEstadoCotizacionDto } from './dto/update-estado-cotizacion.dto';
import { UpdateCotizacionVentaDto } from './dto/update-cotizacion-venta.dto';

@Controller('cotizaciones-ventas')
export class CotizacionesVentasController {
  constructor(
    private readonly cotizacionesService: CotizacionesVentasService,
  ) {}

  @Get()
  @Roles(...ROLES_VENTAS_LECTURA)
  findAll() {
    return this.cotizacionesService.findAll();
  }

  @Get(':id/historial')
  @Roles(...ROLES_VENTAS_LECTURA)
  getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.cotizacionesService.getHistorial(id);
  }

  @Get(':id')
  @Roles(...ROLES_VENTAS_LECTURA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cotizacionesService.findOne(id);
  }

  @Post()
  @Roles(...ROLES_VENTAS_ESCRITURA)
  create(
    @Body() dto: CreateCotizacionVentaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.cotizacionesService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(...ROLES_VENTAS_ESCRITURA)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCotizacionVentaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.cotizacionesService.update(id, dto, user.id);
  }

  @Patch(':id/estado')
  @Roles(...ROLES_VENTAS_APROBACION)
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoCotizacionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.cotizacionesService.actualizarEstado(id, dto, user.id);
  }
}
