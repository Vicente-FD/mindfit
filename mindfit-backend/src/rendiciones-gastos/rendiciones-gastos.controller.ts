import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolUsuario } from '../common/enums';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { RendicionesGastosService } from './rendiciones-gastos.service';
import { CreateRendicionGastoDto } from './dto/create-rendicion-gasto.dto';
import { DecidirRendicionGastoDto } from './dto/decidir-rendicion-gasto.dto';
import { FilterListaGastosDto } from './dto/filter-lista-gastos.dto';
import { boletasMulterStorage } from './storage/boletas.storage';

@Controller('gastos')
export class RendicionesGastosController {
  constructor(
    private readonly rendicionesGastosService: RendicionesGastosService,
  ) {}

  @Get('mi-saldo')
  @Roles(RolUsuario.TECNICO)
  findMiSaldo(@CurrentUser() user: JwtPayload) {
    return this.rendicionesGastosService.findMiSaldo(user.id);
  }

  @Get('admin')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  findAdmin() {
    return this.rendicionesGastosService.findAdminView();
  }

  @Get('lista')
  @Roles(
    RolUsuario.TECNICO,
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
  )
  findLista(
    @Query() filters: FilterListaGastosDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const tecnicoIdScope =
      user.rol === RolUsuario.TECNICO ? user.id : undefined;
    return this.rendicionesGastosService.findLista(filters, {
      tecnicoIdScope,
    });
  }

  @Post()
  @Roles(RolUsuario.TECNICO)
  @UseInterceptors(
    FileInterceptor('boleta', {
      storage: boletasMulterStorage,
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRendicionGastoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar la fotografía de la boleta');
    }
    return this.rendicionesGastosService.create(user.id, dto, file.filename);
  }

  @Patch(':id/decidir')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  decidir(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DecidirRendicionGastoDto,
  ) {
    return this.rendicionesGastosService.decidir(id, dto);
  }
}
