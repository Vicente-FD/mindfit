import {
  BadRequestException,
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
import { Roles } from '../common/decorators/roles.decorator';
import { ROLES_FLOTA } from '../common/constants/roles-flota';
import { CreateLicenciaDto } from './dto/create-licencia.dto';
import { UpdateLicenciaDto } from './dto/update-licencia.dto';
import { LicenciasService } from './licencias.service';
import {
  licenciasDocumentoFileFilter,
  licenciasDocumentoMulterStorage,
} from './storage/licencias-documentos.storage';

const LICENCIA_FILE_OPTIONS = {
  storage: licenciasDocumentoMulterStorage,
  fileFilter: licenciasDocumentoFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
};

@Controller('licencias')
@Roles(...ROLES_FLOTA)
export class LicenciasController {
  constructor(private readonly licenciasService: LicenciasService) {}

  @Get('alertas')
  findAlertas() {
    return this.licenciasService.findAlertas();
  }

  @Get('panel')
  findPanel() {
    return this.licenciasService.findPanel();
  }

  @Get()
  findAll() {
    return this.licenciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.licenciasService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('documento', LICENCIA_FILE_OPTIONS))
  create(
    @Body() dto: CreateLicenciaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debe adjuntar el documento de la licencia (PDF o imagen)',
      );
    }
    return this.licenciasService.create(dto, file.filename);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('documento', LICENCIA_FILE_OPTIONS))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLicenciaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.licenciasService.update(id, dto, file?.filename);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.licenciasService.remove(id);
  }
}
