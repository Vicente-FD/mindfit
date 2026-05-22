import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateMarcaPayload,
  Marca,
  UpdateMarcaPayload,
} from '../models/marca.model';

@Injectable({ providedIn: 'root' })
export class MarcasService {
  private readonly baseUrl = `${environment.apiUrl}/marcas`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.baseUrl);
  }

  create(payload: CreateMarcaPayload, logo?: File): Observable<Marca> {
    const fd = new FormData();
    fd.append('nombre', payload.nombre.trim());
    fd.append('sigla', payload.sigla.trim().toUpperCase());
    if (logo) fd.append('logo', logo);
    return this.http.post<Marca>(this.baseUrl, fd);
  }

  update(
    id: number,
    payload: UpdateMarcaPayload,
    logo?: File,
  ): Observable<Marca> {
    const fd = new FormData();
    if (payload.nombre != null) fd.append('nombre', payload.nombre.trim());
    if (payload.sigla != null) fd.append('sigla', payload.sigla.trim().toUpperCase());
    if (logo) fd.append('logo', logo);
    return this.http.patch<Marca>(`${this.baseUrl}/${id}`, fd);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
