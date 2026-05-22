import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateSucursalPayload,
  Sucursal,
  UpdateSucursalPayload,
} from '../models/sucursal.model';
import { SucursalMonitoreoResponse } from '../models/sucursal-monitoreo.model';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private readonly baseUrl = `${environment.apiUrl}/sucursales`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(this.baseUrl);
  }

  getById(id: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.baseUrl}/${id}`);
  }

  getMonitoreo(id: number): Observable<SucursalMonitoreoResponse> {
    return this.http.get<SucursalMonitoreoResponse>(
      `${this.baseUrl}/${id}/monitoreo`,
    );
  }

  getMonitoreoGlobal(): Observable<SucursalMonitoreoResponse> {
    return this.http.get<SucursalMonitoreoResponse>(
      `${this.baseUrl}/monitoreo/global`,
    );
  }

  create(payload: CreateSucursalPayload): Observable<Sucursal> {
    return this.http.post<Sucursal>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateSucursalPayload): Observable<Sucursal> {
    return this.http.patch<Sucursal>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${id}`);
  }
}
