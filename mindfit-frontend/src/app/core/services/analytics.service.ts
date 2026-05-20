import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnalyticsFilters,
  KpisResponse,
  TecnicoOption,
} from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly baseUrl = `${environment.apiUrl}/analytics`;

  constructor(private readonly http: HttpClient) {}

  getKpis(filters: AnalyticsFilters = {}): Observable<KpisResponse> {
    let params = new HttpParams();
    if (filters.sucursalId != null) {
      params = params.set('sucursalId', String(filters.sucursalId));
    }
    if (filters.tecnicoId != null) {
      params = params.set('tecnicoId', String(filters.tecnicoId));
    }
    if (filters.categoria) {
      params = params.set('categoria', filters.categoria);
    }
    return this.http.get<KpisResponse>(`${this.baseUrl}/kpis`, { params });
  }

  listTecnicos(): Observable<TecnicoOption[]> {
    return this.http.get<TecnicoOption[]>(`${this.baseUrl}/tecnicos`);
  }
}
