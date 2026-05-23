import { OrdenTrabajo } from '../../entities/orden-trabajo.entity';
import { Usuario } from '../../entities/usuario.entity';

export type OrdenTrabajoCalendarioItem = OrdenTrabajo & {
  tecnicoAsignado: Usuario | null;
};

export class CalendarioOrdenesResponseDto {
  mes: string;
  total: number;
  ordenes: OrdenTrabajoCalendarioItem[];
}
