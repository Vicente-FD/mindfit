import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { PlanesPreventivosService } from './planes-preventivos.service';
import { CreatePlanPreventivoDto } from './dto/create-plan-preventivo.dto';
import { UpdatePlanPreventivoDto } from './dto/update-plan-preventivo.dto';

@Controller('planes-preventivos')
@Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
export class PlanesPreventivosController {
  constructor(private readonly service: PlanesPreventivosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlanPreventivoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanPreventivoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
