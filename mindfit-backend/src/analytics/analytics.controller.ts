import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFiltersDto } from './dto/analytics-filters.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.GERENTE_BI,
  )
  getKpis(@Query() filters: AnalyticsFiltersDto) {
    return this.analyticsService.getKpis(filters);
  }

  @Get('tecnicos')
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.JEFE_OPERACIONES,
    RolUsuario.GERENTE_BI,
  )
  listTecnicos() {
    return this.analyticsService.listTecnicos();
  }
}
