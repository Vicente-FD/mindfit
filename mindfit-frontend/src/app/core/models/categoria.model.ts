export interface Categoria {
  id: number;
  nombre: string;
  sigla: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoriaPayload {
  nombre: string;
  sigla: string;
}

export interface UpdateCategoriaPayload {
  nombre?: string;
  sigla?: string;
}
