import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums';
import { AuditTrailService } from './audit-trail.service';
import { FilterAuditTrailDto } from './dto/filter-audit-trail.dto';

@Controller('audit-trail')
@Roles(RolUsuario.ADMIN)
export class AuditTrailController {
  constructor(private readonly auditService: AuditTrailService) {}

  @Get()
  findAll(@Query() query: FilterAuditTrailDto) {
    return this.auditService.findAll(query);
  }
}
