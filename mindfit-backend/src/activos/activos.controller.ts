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
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { ActivosService } from './activos.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';

@Controller('activos')
export class ActivosController {
  constructor(private readonly activosService: ActivosService) {}

  @Public()
  @Get('publico/:uuidActivo')
  findByUuid(@Param('uuidActivo') uuidActivo: string) {
    return this.activosService.findByUuid(uuidActivo);
  }

  @Get()
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.TECNICO,
    RolUsuario.JEFE_SUCURSAL,
    RolUsuario.GERENTE_BI,
  )
  findAll(@Query('sucursalId') sucursalId?: string) {
    const parsed =
      sucursalId != null && sucursalId !== ''
        ? parseInt(sucursalId, 10)
        : undefined;
    return this.activosService.findAll(parsed);
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
}
