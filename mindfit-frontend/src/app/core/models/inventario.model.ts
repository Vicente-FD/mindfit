export interface Repuesto {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string | null;
  costoUnitario: string | number;
}

export interface RepuestoDisponible {
  repuestoId: number;
  stockId: number;
  sku: string;
  nombre: string;
  costoUnitario: number;
  cantidadActual: number;
  cantidadMinimaAlerta: number;
}

export interface BodegaStockRow {
  id: number;
  repuestoId: number;
  cantidadActual: number;
  cantidadMinimaAlerta: number;
  repuesto: Repuesto;
}

export interface BodegaKpis {
  totalSku: number;
  valorizacionInventario: number;
  alertasReorden: number;
}

export interface BodegaMaquina {
  id: number;
  codigoInventario: string;
  nombre: string;
  marca: string;
  modelo: string | null;
  categoria: string;
  estadoOperacional: string;
  aptoParaVenta: boolean;
  precioVentaClp: number;
}

export interface RepuestoCierreItem {
  repuestoId: number;
  cantidad: number;
}

export type TipoMovimientoInventario =
  | 'ingreso_compra'
  | 'ajuste_manual_positivo'
  | 'ajuste_manual_negativo'
  | 'consumo_ot';

export interface CreateRepuestoPayload {
  sku: string;
  nombre: string;
  descripcion?: string;
  costoUnitario: number;
}

export interface UpdateRepuestoPayload {
  sku?: string;
  nombre?: string;
  descripcion?: string;
  costoUnitario?: number;
}

export interface BodegaAjustePayload {
  sucursalId: number;
  repuestoId: number;
  cantidad: number;
  tipoMovimiento: TipoMovimientoInventario;
  motivo: string;
}

export interface MovimientoTrazabilidad {
  id: number;
  tipoMovimiento: TipoMovimientoInventario;
  cantidad: number;
  costoUnitarioMomento: number;
  motivo: string;
  createdAt: string;
  sucursalId: number;
  sucursalNombre: string;
  sucursalSigla: string;
  usuarioNombre: string;
  ordenTrabajoId: number | null;
  codigoOt: string | null;
  ordenTitulo: string | null;
  activoNombre: string | null;
  esEntrada: boolean;
}
