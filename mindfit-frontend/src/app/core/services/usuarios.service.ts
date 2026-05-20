import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
  Usuario,
} from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  get(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateUsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateUsuarioPayload): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}`, payload);
  }

  updatePassword(
    id: number,
    password: string,
  ): Observable<{ updated: boolean }> {
    return this.http.patch<{ updated: boolean }>(
      `${this.baseUrl}/${id}/password`,
      { password },
    );
  }

  deactivate(id: number): Observable<{ deactivated: boolean }> {
    return this.http.delete<{ deactivated: boolean }>(`${this.baseUrl}/${id}`);
  }
}
