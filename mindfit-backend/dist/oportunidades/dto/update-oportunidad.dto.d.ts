import { EtapaOportunidad } from '../../common/enums';
import { OportunidadActividadDto, OportunidadChecklistItemDto } from './oportunidad-crm.dto';
export declare class UpdateOportunidadDto {
    titulo?: string;
    etapa?: EtapaOportunidad;
    montoEstimado?: number;
    divisaCodigo?: string;
    notas?: string;
    fechaCierreEstimada?: string | null;
    checklist?: OportunidadChecklistItemDto[];
    actividades?: OportunidadActividadDto[];
}
