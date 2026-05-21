import { PlanesPreventivosService } from './planes-preventivos.service';
import { CreatePlanPreventivoDto } from './dto/create-plan-preventivo.dto';
import { UpdatePlanPreventivoDto } from './dto/update-plan-preventivo.dto';
export declare class PlanesPreventivosController {
    private readonly service;
    constructor(service: PlanesPreventivosService);
    findAll(): Promise<import("../entities").PlanPreventivo[]>;
    findOne(id: number): Promise<import("../entities").PlanPreventivo>;
    create(dto: CreatePlanPreventivoDto): Promise<import("../entities").PlanPreventivo>;
    update(id: number, dto: UpdatePlanPreventivoDto): Promise<import("../entities").PlanPreventivo>;
    remove(id: number): Promise<{
        deactivated: boolean;
    }>;
}
