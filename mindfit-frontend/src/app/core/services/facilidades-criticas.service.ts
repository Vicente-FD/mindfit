import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  EstadoFacilidadCritica,
  FacilidadCriticaItem,
  FacilidadHistorialItem,
  FacilidadesResumen,
  SedeSemaforoResumen,
} from '../models/facilidad-critica.model';

@Injectable({ providedIn: 'root' })
export class FacilidadesCriticasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/facilidades-criticas`;

  miSucursal(): Observable<FacilidadesResumen> {
    return this.http.get<FacilidadesResumen>(`${this.baseUrl}/mi-sucursal`);
  }

  resumenSedes(): Observable<SedeSemaforoResumen[]> {
    return this.http.get<SedeSemaforoResumen[]>(`${this.baseUrl}/resumen-sedes`);
  }

  porSucursal(sucursalId: number): Observable<FacilidadesResumen> {
    return this.http.get<FacilidadesResumen>(
      `${this.baseUrl}/sucursal/${sucursalId}`,
    );
  }

  historial(facilidadId: number): Observable<FacilidadHistorialItem[]> {
    return this.http.get<FacilidadHistorialItem[]>(
      `${this.baseUrl}/${facilidadId}/historial`,
    );
  }

  reportarAreaServicios(formData: FormData): Observable<{
    ordenId: number;
    codigoOt: string;
    titulo: string;
    facilidadCriticaId: number | null;
    esFallaGeneral: boolean;
  }> {
    return this.http.post<{
      ordenId: number;
      codigoOt: string;
      titulo: string;
      facilidadCriticaId: number | null;
      esFallaGeneral: boolean;
    }>(`${this.baseUrl}/reportar-area-servicios`, formData);
  }

  reportarFalla(
    facilidadId: number,
    body: { descripcionProblema: string; notasTecnicas?: string },
  ): Observable<FacilidadCriticaItem> {
    return this.http.patch<FacilidadCriticaItem>(
      `${this.baseUrl}/${facilidadId}/reportar-falla`,
      body,
    );
  }

  actualizarEstado(
    facilidadId: number,
    body: { estado: EstadoFacilidadCritica; notasTecnicas?: string },
  ): Observable<FacilidadCriticaItem> {
    return this.http.patch<FacilidadCriticaItem>(
      `${this.baseUrl}/${facilidadId}/estado`,
      body,
    );
  }
}
