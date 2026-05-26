import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateOportunidadDto } from './dto/create-oportunidad.dto';
import { UpdateOportunidadDto } from './dto/update-oportunidad.dto';
import { OportunidadesService } from './oportunidades.service';
export declare class OportunidadesController {
    private readonly oportunidadesService;
    constructor(oportunidadesService: OportunidadesService);
    findAll(): Promise<import("../entities").Oportunidad[]>;
    findOne(id: number): Promise<import("../entities").Oportunidad>;
    create(dto: CreateOportunidadDto, user: JwtPayload): Promise<import("../entities").Oportunidad>;
    update(id: number, dto: UpdateOportunidadDto): Promise<import("../entities").Oportunidad>;
}
