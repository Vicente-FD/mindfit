import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateVehiculoPayload,
  UpdateVehiculoPayload,
  Vehiculo,
  VehiculoConAlertas,
} from '../models/flota.model';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private readonly baseUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.baseUrl);
  }

  alertas(): Observable<VehiculoConAlertas[]> {
    return this.http.get<VehiculoConAlertas[]>(`${this.baseUrl}/alertas`);
  }

  create(payload: CreateVehiculoPayload): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateVehiculoPayload): Observable<Vehiculo> {
    return this.http.patch<Vehiculo>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
