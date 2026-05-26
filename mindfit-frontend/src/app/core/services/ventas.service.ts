import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CatalogoVentaItem,
  Cliente,
  CotizacionVenta,
  CreateClientePayload,
  CreateCotizacionPayload,
  CreateOportunidadPayload,
  Oportunidad,
  TasasDivisa,
  DashboardComercial,
  DashboardEjecutivo,
  EstadoCotizacionVenta,
  VentasDashboard,
} from '../models/ventas.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly clientesUrl = `${environment.apiUrl}/clientes`;
  private readonly oportunidadesUrl = `${environment.apiUrl}/oportunidades`;
  private readonly cotizacionesUrl = `${environment.apiUrl}/cotizaciones-ventas`;
  private readonly ventasUrl = `${environment.apiUrl}/ventas`;
  private readonly divisasUrl = `${environment.apiUrl}/divisas`;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<VentasDashboard> {
    return this.http.get<VentasDashboard>(`${this.ventasUrl}/dashboard`);
  }

  getDashboardEjecutivo(): Observable<DashboardEjecutivo> {
    return this.http.get<DashboardEjecutivo>(
      `${this.ventasUrl}/dashboard-ejecutivo`,
    );
  }

  getDashboardComercial(): Observable<DashboardComercial> {
    return this.http.get<DashboardComercial>(
      `${this.ventasUrl}/dashboard-comercial`,
    );
  }

  buscarCatalogo(
    busqueda?: string,
    soloHabilitadas = false,
  ): Observable<CatalogoVentaItem[]> {
    let params = new HttpParams();
    if (busqueda?.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }
    if (soloHabilitadas) {
      params = params.set('soloHabilitadas', 'true');
    }
    return this.http.get<CatalogoVentaItem[]>(`${this.ventasUrl}/catalogo`, {
      params,
    });
  }

  getTasas(): Observable<TasasDivisa> {
    return this.http.get<TasasDivisa>(`${this.divisasUrl}/tasas`);
  }

  listClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.clientesUrl);
  }

  createCliente(payload: CreateClientePayload): Observable<Cliente> {
    return this.http.post<Cliente>(this.clientesUrl, payload);
  }

  updateCliente(
    id: number,
    payload: Partial<CreateClientePayload>,
  ): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.clientesUrl}/${id}`, payload);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.clientesUrl}/${id}`);
  }

  listOportunidades(): Observable<Oportunidad[]> {
    return this.http.get<Oportunidad[]>(this.oportunidadesUrl);
  }

  createOportunidad(
    payload: CreateOportunidadPayload,
  ): Observable<Oportunidad> {
    return this.http.post<Oportunidad>(this.oportunidadesUrl, payload);
  }

  updateOportunidad(
    id: number,
    payload: Partial<CreateOportunidadPayload>,
  ): Observable<Oportunidad> {
    return this.http.patch<Oportunidad>(
      `${this.oportunidadesUrl}/${id}`,
      payload,
    );
  }

  listCotizaciones(): Observable<CotizacionVenta[]> {
    return this.http.get<CotizacionVenta[]>(this.cotizacionesUrl);
  }

  createCotizacion(
    payload: CreateCotizacionPayload,
  ): Observable<CotizacionVenta> {
    return this.http.post<CotizacionVenta>(this.cotizacionesUrl, payload);
  }

  actualizarEstadoCotizacion(
    id: number,
    estado: Extract<EstadoCotizacionVenta, 'aprobada' | 'rechazada'>,
  ): Observable<CotizacionVenta> {
    return this.http.patch<CotizacionVenta>(
      `${this.cotizacionesUrl}/${id}/estado`,
      { estado },
    );
  }
}
