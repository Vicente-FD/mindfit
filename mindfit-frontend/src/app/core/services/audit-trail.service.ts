import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuditTrailFilters,
  AuditTrailResponse,
} from '../models/audit-trail.model';

@Injectable({ providedIn: 'root' })
export class AuditTrailService {
  private readonly baseUrl = `${environment.apiUrl}/audit-trail`;

  constructor(private readonly http: HttpClient) {}

  list(filters: AuditTrailFilters = {}): Observable<AuditTrailResponse> {
    let params = new HttpParams();
    if (filters.page != null) {
      params = params.set('page', String(filters.page));
    }
    if (filters.limit != null) {
      params = params.set('limit', String(filters.limit));
    }
    if (filters.tableName) {
      params = params.set('tableName', filters.tableName);
    }
    return this.http.get<AuditTrailResponse>(this.baseUrl, { params });
  }
}
