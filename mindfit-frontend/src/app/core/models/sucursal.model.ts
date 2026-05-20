export interface Sucursal {
  id: number;
  nombre: string;
  sigla?: string;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
  estaActiva?: boolean;
}

export const CASA_CENTRAL_VALUE = 'casa_central';
