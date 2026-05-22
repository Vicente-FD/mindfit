import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import {
  buildMarcaLogoUrl,
  marcasLogoStorage,
} from './storage/marcas-logo.storage';

@Controller('marcas')
export class MarcasController {
  constructor(
    private readonly marcasService: MarcasService,
    private readonly configService: ConfigService,
  ) {}

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
  @UseInterceptors(FileInterceptor('logo', { storage: marcasLogoStorage }))
  create(
    @Body() dto: CreateMarcaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const port = this.configService.get<number>('PORT', 3000);
    const logoUrl = file ? buildMarcaLogoUrl(file.filename, port) : undefined;
    return this.marcasService.create(dto, logoUrl);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  @UseInterceptors(FileInterceptor('logo', { storage: marcasLogoStorage }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMarcaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const port = this.configService.get<number>('PORT', 3000);
    const logoUrl = file ? buildMarcaLogoUrl(file.filename, port) : undefined;
    return this.marcasService.update(id, dto, logoUrl);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RolUsuario.ADMIN, RolUsuario.JEFE_OPERACIONES)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.remove(id);
  }
}
