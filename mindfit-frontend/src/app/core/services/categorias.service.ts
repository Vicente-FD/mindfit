import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  CreateCategoriaPayload,
  UpdateCategoriaPayload,
} from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly baseUrl = `${environment.apiUrl}/categorias`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  create(payload: CreateCategoriaPayload): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateCategoriaPayload): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
