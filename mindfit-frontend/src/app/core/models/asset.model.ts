import { WorkOrderSucursal } from './work-order.model';

export interface PublicAsset {
  id: number;
  uuidActivo: string;
  codigoQrToken: string;
  nombre: string;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  categoria: string;
  sucursalId: number;
  estadoOperacional: string;
  sucursal?: WorkOrderSucursal;
}
