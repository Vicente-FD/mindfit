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

  listRecuperacionPendientes(): Observable<SolicitudRecuperacionPendiente[]> {
    return this.http.get<SolicitudRecuperacionPendiente[]>(
      `${this.baseUrl}/recuperar/pendientes`,
    );
  }

  aprobarRecuperacion(
    solicitudId: number,
  ): Observable<AprobarRecuperacionResponse> {
    return this.http.patch<AprobarRecuperacionResponse>(
      `${this.baseUrl}/recuperar/aprobar/${solicitudId}`,
      {},
    );
  }

  rechazarRecuperacion(solicitudId: number): Observable<{ solicitudId: number }> {
    return this.http.patch<{ solicitudId: number }>(
      `${this.baseUrl}/recuperar/rechazar/${solicitudId}`,
      {},
    );
  }
}

export interface SolicitudRecuperacionPendiente {
  id: number;
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string;
  createdAt: string;
}

export interface AprobarRecuperacionResponse {
  solicitudId: number;
  usuarioId: number;
  contrasenaTemporal: string;
}
