import { DataSource } from 'typeorm';
import { LicenciaTecnico } from '../entities/licencia-tecnico.entity';
import { CreateLicenciaDto } from './dto/create-licencia.dto';
import { UpdateLicenciaDto } from './dto/update-licencia.dto';
export interface LicenciaPanelRow {
    tecnicoId: number;
    tecnicoNombre: string;
    tecnicoEmail: string;
    licenciaId: number | null;
    tipoLicencia: string | null;
    fechaVencimiento: string | null;
    documentoUrl: string | null;
    diasRestantes: number | null;
}
export declare class LicenciasService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private licenciaRepo;
    private usuarioRepo;
    findPanel(): Promise<LicenciaPanelRow[]>;
    findAll(): Promise<LicenciaTecnico[]>;
    findAlertas(): Promise<LicenciaTecnico[]>;
    findOne(id: number): Promise<LicenciaTecnico>;
    private assertTecnicoActivo;
    private setDocumentoUrl;
    create(dto: CreateLicenciaDto, documentoFilename: string): Promise<LicenciaTecnico>;
    update(id: number, dto: UpdateLicenciaDto, documentoFilename?: string): Promise<LicenciaTecnico>;
    remove(id: number): Promise<void>;
}
