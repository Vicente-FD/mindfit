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
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { InventarioService } from './inventario.service';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { FilterBodegaDto } from './dto/filter-bodega.dto';
import { AjustarStockDto } from './dto/ajustar-stock.dto';
import { IngresoStockDto } from './dto/ingreso-stock.dto';

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

  @Patch('repuestos/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.BODEGUERO)
  updateRepuesto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRepuestoDto,
  ) {
    return this.inventario.updateRepuesto(id, dto);
  }

  @Get('bodega/stock')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
  )
  listStock(@Query() query: FilterBodegaDto) {
    return this.inventario.findStock(query);
  }

  @Get('bodega/kpis')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.BODEGUERO,
  )
  getKpis() {
    return this.inventario.getKpis();
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
