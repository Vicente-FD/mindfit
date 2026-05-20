export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string | null;
  comuna: string | null;
  ciudad: string | null;
  estaActiva: boolean;
}
