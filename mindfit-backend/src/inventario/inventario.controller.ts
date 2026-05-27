import {
  Body,
  Controller,
  Delete,
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
import { InventarioService } from './inventario.service';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { FilterBodegaDto } from './dto/filter-bodega.dto';
import { AjustarStockDto } from './dto/ajustar-stock.dto';
import { IngresoStockDto } from './dto/ingreso-stock.dto';
import { BodegaAjusteDto } from './dto/bodega-ajuste.dto';
import { UpdateMaquinaVentaDto } from './dto/update-maquina-venta.dto';

@Controller()
export class InventarioController {
  constructor(private readonly inventario: InventarioService) {}

  @Get('repuestos')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
  )
  listRepuestos() {
    return this.inventario.findAllRepuestos();
  }

  @Get('bodega/repuestos-disponibles')
  @Roles(
    RolUsuario.TECNICO,
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
  )
  repuestosDisponibles() {
    return this.inventario.listRepuestosDisponibles();
  }

  @Post('repuestos')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.BODEGUERO)
  createRepuesto(@Body() dto: CreateRepuestoDto) {
    return this.inventario.createRepuesto(dto);
  }

  @Get('repuestos/:id/trazabilidad')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
  )
  getTrazabilidad(
    @Param('id', ParseIntPipe) id: number,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const parsed =
      sucursalId != null && sucursalId !== ''
        ? Number(sucursalId)
        : undefined;
    return this.inventario.getTrazabilidad(id, parsed);
  }

  @Patch('repuestos/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.BODEGUERO)
  updateRepuesto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRepuestoDto,
  ) {
    return this.inventario.updateRepuesto(id, dto);
  }

  @Delete('repuestos/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.BODEGUERO)
  removeRepuesto(@Param('id', ParseIntPipe) id: number) {
    return this.inventario.softDeleteRepuesto(id);
  }

  @Post('bodega/ajuste')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.BODEGUERO)
  registrarAjuste(
    @Body() dto: BodegaAjusteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventario.registrarAjuste(dto, user.id);
  }

  @Get('bodega/stock')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
    RolUsuario.EJECUTIVO_VENTAS,
    RolUsuario.GERENTE_BI,
  )
  listStock(@Query() query: FilterBodegaDto) {
    return this.inventario.findStock(query);
  }

  @Get('bodega/kpis')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
    RolUsuario.EJECUTIVO_VENTAS,
    RolUsuario.GERENTE_BI,
  )
  getKpis() {
    return this.inventario.getKpis();
  }

  @Get('bodega/maquinas')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
  )
  listMaquinasBodega(@Query('busqueda') busqueda?: string) {
    return this.inventario.listMaquinasBodega(busqueda);
  }

  @Patch('bodega/maquinas/:id/venta-comercial')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
  )
  updateMaquinaVentaComercial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaquinaVentaDto,
  ) {
    return this.inventario.updateMaquinaVentaComercial(
      id,
      dto.aptoParaVenta,
      dto.precioVentaClp,
    );
  }

  @Post('bodega/stock/:id/ajustar')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.BODEGUERO)
  ajustarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AjustarStockDto,
  ) {
    return this.inventario.ajustarStock(id, dto.cantidadActual);
  }

  @Post('bodega/stock/:id/ingreso')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.BODEGUERO)
  registrarIngreso(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: IngresoStockDto,
  ) {
    return this.inventario.registrarIngreso(id, dto.cantidad);
  }

  @Post('bodega/repuesto/:repuestoId')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.BODEGUERO)
  asegurarFilaStock(@Param('repuestoId', ParseIntPipe) repuestoId: number) {
    return this.inventario.asegurarStock(repuestoId);
  }
}
