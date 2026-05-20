import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicAsset } from '../models/asset.model';
import { AssetCategory } from '../models/analytics.model';
import { ActivoHistorialItem } from '../models/activo-historial.model';

export interface Activo extends PublicAsset {
  fechaCompra: string | null;
  fechaVencimientoGarantia: string | null;
  costoAdquisicion: string | null;
  documentacionUrls: string[];
}

export interface ActivosFilter {
  sucursalId?: number;
  marcaId?: number;
  categoria?: AssetCategory;
  anioCompra?: number;
  busqueda?: string;
}

export interface CreateActivoPayload {
  nombre: string;
  marcaId: number;
  modelo?: string;
  numeroSerie?: string;
  categoria: AssetCategory;
  sucursalId: number;
  fechaCompra?: string;
  fechaVencimientoGarantia?: string;
  costoAdquisicion?: number;
}

export interface UpdateActivoPayload {
  nombre?: string;
  marcaId?: number;
  modelo?: string;
  numeroSerie?: string;
  categoria?: AssetCategory;
  sucursalId?: number;
  fechaCompra?: string;
  fechaVencimientoGarantia?: string;
  costoAdquisicion?: number;
  estadoOperacional?: string;
}

@Injectable({ providedIn: 'root' })
export class ActivosService {
  private readonly baseUrl = `${environment.apiUrl}/activos`;

  constructor(private readonly http: HttpClient) {}

  list(filters: ActivosFilter = {}): Observable<Activo[]> {
    let params = new HttpParams();
    if (filters.sucursalId != null) {
      params = params.set('sucursalId', String(filters.sucursalId));
    }
    if (filters.marcaId != null) {
      params = params.set('marcaId', String(filters.marcaId));
    }
    if (filters.categoria) {
      params = params.set('categoria', filters.categoria);
    }
    if (filters.anioCompra != null) {
      params = params.set('anioCompra', String(filters.anioCompra));
    }
    if (filters.busqueda?.trim()) {
      params = params.set('busqueda', filters.busqueda.trim());
    }
    return this.http.get<Activo[]>(this.baseUrl, { params });
  }

  getPublic(identifier: string): Observable<Activo> {
    return this.http.get<Activo>(
      `${this.baseUrl}/publico/${encodeURIComponent(identifier)}`,
    );
  }

  create(payload: CreateActivoPayload): Observable<Activo> {
    return this.http.post<Activo>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateActivoPayload): Observable<Activo> {
    return this.http.patch<Activo>(`${this.baseUrl}/${id}`, payload);
  }

  getHistorial(id: number): Observable<ActivoHistorialItem[]> {
    return this.http.get<ActivoHistorialItem[]>(
      `${this.baseUrl}/${id}/historial`,
    );
  }
}
