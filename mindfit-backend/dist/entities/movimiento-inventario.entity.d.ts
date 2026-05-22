import { TipoMovimientoInventario } from '../common/enums';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { Repuesto } from './repuesto.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
export declare class MovimientoInventario {
    id: number;
    sucursalId: number;
    sucursal: Sucursal;
    repuestoId: number;
    repuesto: Repuesto;
    usuarioId: number;
    usuario: Usuario;
    tipoMovimiento: TipoMovimientoInventario;
    cantidad: number;
    costoUnitarioMomento: string;
    ordenTrabajoId: number | null;
    ordenTrabajo: OrdenTrabajo | null;
    motivo: string;
    createdAt: Date;
}
