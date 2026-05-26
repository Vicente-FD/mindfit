import { Controller, Get } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLES_VENTAS_LECTURA } from '../common/constants/roles-ventas';
import { DivisasService } from './divisas.service';
@Controller('divisas')
export class DivisasController {
  constructor(private readonly divisasService: DivisasService) {}

  @Get('tasas')
  @Roles(...ROLES_VENTAS_LECTURA)
  getTasas() {    return this.divisasService.getTasas();
  }
}
