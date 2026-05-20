import { AnalyticsService } from './analytics.service';
import { AnalyticsFiltersDto } from './dto/analytics-filters.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getKpis(filters: AnalyticsFiltersDto): Promise<import("./analytics.service").KpisResponse>;
    listTecnicos(): Promise<import("../entities").Usuario[]>;
}
