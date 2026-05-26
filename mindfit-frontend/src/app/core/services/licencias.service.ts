import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LicenciaPanelRow, LicenciaTecnico } from '../models/flota.model';

@Injectable({ providedIn: 'root' })
export class LicenciasService {
  private readonly baseUrl = `${environment.apiUrl}/licencias`;

  constructor(private readonly http: HttpClient) {}

  panel(): Observable<LicenciaPanelRow[]> {
    return this.http.get<LicenciaPanelRow[]>(`${this.baseUrl}/panel`);
  }

  alertas(): Observable<LicenciaTecnico[]> {
    return this.http.get<LicenciaTecnico[]>(`${this.baseUrl}/alertas`);
  }

  createWithDocument(form: FormData): Observable<LicenciaTecnico> {
    return this.http.post<LicenciaTecnico>(this.baseUrl, form);
  }

  updateWithDocument(
    id: number,
    form: FormData,
  ): Observable<LicenciaTecnico> {
    return this.http.patch<LicenciaTecnico>(`${this.baseUrl}/${id}`, form);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
