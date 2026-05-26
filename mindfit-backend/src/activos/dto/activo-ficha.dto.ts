import { ActivoHistorialEventoDto } from './activo-historial-evento.dto';

export interface OrdenActivaResumenDto {
  id: number;
  codigoOt: string;
  titulo: string;
  estado: string;
  prioridad: string;
  asignadoAId: number | null;
  asignadoANombre: string | null;
}

export interface ActivoFichaDto {
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
    sucursalId: number | null;
    sucursalNombre: string | null;
  };
  historial: ActivoHistorialEventoDto[];
  ordenesActivas: OrdenActivaResumenDto[];
}
