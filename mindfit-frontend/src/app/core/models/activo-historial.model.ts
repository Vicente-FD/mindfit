export interface HistorialUsuario {
  id: number;
  nombre: string;
  email?: string;
  rol?: string;
}

export interface HistorialEvidencia {
  id: number;
  tipoEvidencia: 'antes' | 'despues';
  urlImagen: string;
  createdAt: string;
}

export interface HistorialComentario {
  id: number;
  comentario: string;
  autor: HistorialUsuario;
  createdAt: string;
}

export interface ActivoHistorialItem {
  id: number;
  codigoOt: string;
  titulo: string;
  descripcion: string | null;
  prioridad: string;
  tipoMantenimiento: string;
  estado: string;
  fechaResolucion: string | null;
  duracionLabel: string | null;
  creadoPor: HistorialUsuario;
  asignadoA: HistorialUsuario | null;
  comentarioCierre: string | null;
  evidencias: HistorialEvidencia[];
  comentarios: HistorialComentario[];
}
