import { ActivoHistorialItem } from './activo-historial.model';

export interface OrdenActivaResumen {
  id: number;
  codigoOt: string;
  titulo: string;
  estado: string;
  prioridad: string;
  asignadoAId: number | null;
  asignadoANombre: string | null;
}

export interface ActivoFicha {
  activo: {
    id: number;
    uuidActivo: string;
    codigoQrToken: string;
    codigoInventario: string;
    nombre: string;
    marca: string | null;
    modelo: string | null;
    categoria: string;
    estadoOperacional: string;
    sucursalId: number;
    sucursalNombre: string | null;
  };
  historial: ActivoHistorialItem[];
  ordenesActivas: OrdenActivaResumen[];
}
