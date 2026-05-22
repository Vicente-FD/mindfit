import { Activo } from '../../entities/activo.entity';
export interface CreateActivosResultDto {
    total: number;
    activos: Activo[];
}
