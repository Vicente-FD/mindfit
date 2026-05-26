import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLES_VENTAS_LECTURA } from '../common/constants/roles-ventas';
import { VentasService } from './ventas.service';
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get('dashboard')
  @Roles(...ROLES_VENTAS_LECTURA)
  dashboard() {
    return this.ventasService.getDashboard();
  }

  @Get('dashboard-ejecutivo')
  @Roles(...ROLES_VENTAS_LECTURA)
  dashboardEjecutivo() {
    return this.ventasService.getDashboardEjecutivo();
  }

  @Get('dashboard-comercial')
  @Roles(...ROLES_VENTAS_LECTURA)
  dashboardComercial() {
    return this.ventasService.getDashboardComercial();
  }

  @Get('catalogo')
  @Roles(...ROLES_VENTAS_LECTURA)
  catalogo(
    @Query('busqueda') busqueda?: string,
    @Query('soloHabilitadas') soloHabilitadas?: string,
  ) {
    return this.ventasService.buscarCatalogo(
      busqueda,
      soloHabilitadas === 'true' || soloHabilitadas === '1',
    );
  }
}
