import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BodegaKpis,
  BodegaStockRow,
  Repuesto,
  RepuestoDisponible,
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

  ajustarStock(stockId: number, cantidadActual: number): Observable<BodegaStockRow> {
    return this.http.post<BodegaStockRow>(
      `${this.api}/bodega/stock/${stockId}/ajustar`,
      { cantidadActual },
    );
  }

  registrarIngreso(stockId: number, cantidad: number): Observable<BodegaStockRow> {
    return this.http.post<BodegaStockRow>(
      `${this.api}/bodega/stock/${stockId}/ingreso`,
      { cantidad },
    );
  }

  asegurarFilaStock(repuestoId: number): Observable<BodegaStockRow> {
    return this.http.post<BodegaStockRow>(
      `${this.api}/bodega/repuesto/${repuestoId}`,
      {},
    );
  }
}
