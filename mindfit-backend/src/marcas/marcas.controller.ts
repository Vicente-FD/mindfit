import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Get()
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.TECNICO,
    RolUsuario.JEFE_SUCURSAL,
    RolUsuario.GERENTE_BI,
  )
  findAll() {
    return this.marcasService.findAll();
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.findOne(id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  create(@Body() dto: CreateMarcaDto) {
    return this.marcasService.create(dto);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMarcaDto,
  ) {
    return this.marcasService.update(id, dto);
  }
}
