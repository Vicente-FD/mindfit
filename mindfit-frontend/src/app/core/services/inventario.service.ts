import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BodegaAjustePayload,
  BodegaKpis,
  BodegaStockRow,
  CreateRepuestoPayload,
  MovimientoTrazabilidad,
  Repuesto,
  RepuestoDisponible,
  UpdateRepuestoPayload,
} from '../models/inventario.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly api = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  repuestosDisponibles(): Observable<RepuestoDisponible[]> {
    return this.http.get<RepuestoDisponible[]>(
      `${this.api}/bodega/repuestos-disponibles`,
    );
  }

  listStock(busqueda?: string): Observable<BodegaStockRow[]> {
    let params = new HttpParams();
    if (busqueda?.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }
    return this.http.get<BodegaStockRow[]>(`${this.api}/bodega/stock`, {
      params,
    });
  }

  getKpis(): Observable<BodegaKpis> {
    return this.http.get<BodegaKpis>(`${this.api}/bodega/kpis`);
  }

  listRepuestos(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(`${this.api}/repuestos`);
  }

  createRepuesto(payload: CreateRepuestoPayload): Observable<Repuesto> {
    return this.http.post<Repuesto>(`${this.api}/repuestos`, payload);
  }

  updateRepuesto(
    id: number,
    payload: UpdateRepuestoPayload,
  ): Observable<Repuesto> {
    return this.http.patch<Repuesto>(`${this.api}/repuestos/${id}`, payload);
  }

  deleteRepuesto(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(
      `${this.api}/repuestos/${id}`,
    );
  }

  registrarAjuste(payload: BodegaAjustePayload): Observable<BodegaStockRow> {
    return this.http.post<BodegaStockRow>(`${this.api}/bodega/ajuste`, payload);
  }

  getTrazabilidad(
    repuestoId: number,
    sucursalId?: number,
  ): Observable<MovimientoTrazabilidad[]> {
    let params = new HttpParams();
    if (sucursalId != null) {
      params = params.set('sucursalId', String(sucursalId));
    }
    return this.http.get<MovimientoTrazabilidad[]>(
      `${this.api}/repuestos/${repuestoId}/trazabilidad`,
      { params },
    );
  }

  asegurarFilaStock(repuestoId: number): Observable<BodegaStockRow> {
    return this.http.post<BodegaStockRow>(
      `${this.api}/bodega/repuesto/${repuestoId}`,
      {},
    );
  }
}
