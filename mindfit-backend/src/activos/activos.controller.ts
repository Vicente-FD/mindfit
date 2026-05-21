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
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { InventarioService } from '../inventario/inventario.service';
import { ActivosService } from './activos.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { FilterActivosDto } from './dto/filter-activos.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';

@Controller('activos')
export class ActivosController {
  constructor(
    private readonly activosService: ActivosService,
    private readonly inventarioService: InventarioService,
  ) {}

  @Public()
  @Get('publico/:uuidActivo/ficha')
  getFichaPublica(@Param('uuidActivo') uuidActivo: string) {
    return this.activosService.getFichaPublica(uuidActivo);
  }

  @Public()
  @Get('publico/:uuidActivo')
  findByUuid(@Param('uuidActivo') uuidActivo: string) {
    return this.activosService.findByUuid(uuidActivo);
  }

  /** @deprecated Usar GET /api/bodega/repuestos-disponibles (bodega global). */
  @Get('sucursal/:sucursalId/repuestos-disponibles')
  @Roles(RolUsuario.TECNICO, RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  repuestosDisponiblesLegacy() {
    return this.inventarioService.listRepuestosDisponibles();
  }

  @Get()
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.TECNICO,
    RolUsuario.JEFE_SUCURSAL,
    RolUsuario.GERENTE_BI,
  )
  findAll(@Query() filters: FilterActivosDto) {
    return this.activosService.findAll(filters);
  }

  @Get(':id/historial')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.TECNICO,
    RolUsuario.JEFE_SUCURSAL,
    RolUsuario.GERENTE_BI,
  )
  getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.activosService.getHistorial(id);
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
    return this.activosService.findOne(id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  create(@Body() dto: CreateActivoDto) {
    return this.activosService.create(dto);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES, RolUsuario.JEFE_SUCURSAL)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivoDto,
  ) {
    return this.activosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activosService.remove(id);
  }
}
