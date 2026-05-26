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
import { ROLES_VENTAS_ESCRITURA, ROLES_VENTAS_LECTURA } from '../common/constants/roles-ventas';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateOportunidadDto } from './dto/create-oportunidad.dto';
import { UpdateOportunidadDto } from './dto/update-oportunidad.dto';
import { OportunidadesService } from './oportunidades.service';

@Controller('oportunidades')
export class OportunidadesController {
  constructor(private readonly oportunidadesService: OportunidadesService) {}

  @Get()
  @Roles(...ROLES_VENTAS_LECTURA)
  findAll() {
    return this.oportunidadesService.findAll();
  }

  @Get(':id')
  @Roles(...ROLES_VENTAS_LECTURA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.oportunidadesService.findOne(id);
  }

  @Post()
  @Roles(...ROLES_VENTAS_ESCRITURA)
  create(
    @Body() dto: CreateOportunidadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.oportunidadesService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(...ROLES_VENTAS_ESCRITURA)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOportunidadDto,
  ) {
    return this.oportunidadesService.update(id, dto);
  }
}
