import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicAsset } from '../models/asset.model';
import { AssetCategory } from '../models/analytics.model';

export interface Activo extends PublicAsset {
  fechaCompra: string | null;
  fechaVencimientoGarantia: string | null;
  costoAdquisicion: string | null;
  documentacionUrls: string[];
}

export interface CreateActivoPayload {
  nombre: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  categoria: AssetCategory;
  sucursalId: number;
  fechaCompra?: string;
  fechaVencimientoGarantia?: string;
  costoAdquisicion?: number;
}

@Injectable({ providedIn: 'root' })
export class ActivosService {
  private readonly baseUrl = `${environment.apiUrl}/activos`;

  constructor(private readonly http: HttpClient) {}

  list(sucursalId?: number): Observable<Activo[]> {
    const params = sucursalId != null ? `?sucursalId=${sucursalId}` : '';
    return this.http.get<Activo[]>(`${this.baseUrl}${params}`);
  }

  getPublic(identifier: string): Observable<Activo> {
    return this.http.get<Activo>(
      `${this.baseUrl}/publico/${encodeURIComponent(identifier)}`,
    );
  }

  create(payload: CreateActivoPayload): Observable<Activo> {
    return this.http.post<Activo>(this.baseUrl, payload);
  }
}
