export interface Repuesto {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
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

export interface RepuestoCierreItem {
  repuestoId: number;
  cantidad: number;
}
