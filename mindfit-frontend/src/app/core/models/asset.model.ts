import { WorkOrderSucursal } from './work-order.model';

export interface MarcaRef {
  id: number;
  nombre: string;
  sigla: string;
  logoUrl?: string | null;
}

export interface CategoriaRef {
  id: number;
  nombre: string;
  sigla: string;
}

export interface PublicAsset {
  id: number;
  uuidActivo: string;
  codigoQrToken: string | null;
  codigoInventario: string;
  nombre: string;
  marca: string | null;
  marcaId: number | null;
  marcaRelacion?: MarcaRef | null;
  modelo: string | null;
  numeroSerie: string | null;
  categoria: string;
  categoriaId?: number | null;
  categoriaRelacion?: CategoriaRef | null;
  pisoAsignado?: number | null;
  sucursalId: number | null;
  estadoOperacional: string;
  aptoParaVenta?: boolean;
  precioVentaClp?: string | number;
  sucursal?: WorkOrderSucursal & { sigla?: string };
}
