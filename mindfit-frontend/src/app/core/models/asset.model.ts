import { WorkOrderSucursal } from './work-order.model';

export interface MarcaRef {
  id: number;
  nombre: string;
  sigla: string;
}

export interface PublicAsset {
  id: number;
  uuidActivo: string;
  codigoQrToken: string;
  codigoInventario: string;
  nombre: string;
  marca: string | null;
  marcaId: number | null;
  marcaRelacion?: MarcaRef | null;
  modelo: string | null;
  numeroSerie: string | null;
  categoria: string;
  sucursalId: number;
  estadoOperacional: string;
  sucursal?: WorkOrderSucursal & { sigla?: string };
}
