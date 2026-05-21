import { AuditTrailService } from './audit-trail.service';
import { FilterAuditTrailDto } from './dto/filter-audit-trail.dto';
export declare class AuditTrailController {
    private readonly auditService;
    constructor(auditService: AuditTrailService);
    findAll(query: FilterAuditTrailDto): Promise<{
        data: import("./audit-trail.service").AuditTrailItemDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
