import { EtapaOportunidad } from '../../common/enums';
export declare class CreateOportunidadDto {
    clienteId: number;
    titulo: string;
    etapa?: EtapaOportunidad;
    montoEstimado?: number;
    divisaCodigo?: string;
    notas?: string;
    fechaCierreEstimada?: string;
}
