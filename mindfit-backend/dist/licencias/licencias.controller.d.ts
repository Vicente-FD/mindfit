import { CreateLicenciaDto } from './dto/create-licencia.dto';
import { UpdateLicenciaDto } from './dto/update-licencia.dto';
import { LicenciasService } from './licencias.service';
export declare class LicenciasController {
    private readonly licenciasService;
    constructor(licenciasService: LicenciasService);
    findAlertas(): Promise<import("../entities").LicenciaTecnico[]>;
    findPanel(): Promise<import("./licencias.service").LicenciaPanelRow[]>;
    findAll(): Promise<import("../entities").LicenciaTecnico[]>;
    findOne(id: number): Promise<import("../entities").LicenciaTecnico>;
    create(dto: CreateLicenciaDto, file?: Express.Multer.File): Promise<import("../entities").LicenciaTecnico>;
    update(id: number, dto: UpdateLicenciaDto, file?: Express.Multer.File): Promise<import("../entities").LicenciaTecnico>;
    remove(id: number): Promise<void>;
}
