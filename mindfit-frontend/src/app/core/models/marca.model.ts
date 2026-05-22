export interface Marca {
  id: number;
  nombre: string;
  sigla: string;
  logoUrl?: string | null;
}

export interface CreateMarcaPayload {
  nombre: string;
  sigla: string;
}

export interface UpdateMarcaPayload {
  nombre?: string;
  sigla?: string;
}
