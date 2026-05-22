import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminGastosView,
  DecidirGastoPayload,
  ListaGastosParams,
  ListaGastosResponse,
  MiSaldoGastos,
  RendicionGasto,
} from '../models/gastos.model';

@Injectable({ providedIn: 'root' })
export class GastosService {
  private readonly base = `${environment.apiUrl}/gastos`;

  constructor(private readonly http: HttpClient) {}

  getMiSaldo(): Observable<MiSaldoGastos> {
    return this.http.get<MiSaldoGastos>(`${this.base}/mi-saldo`);
  }

  getAdminView(): Observable<AdminGastosView> {
    return this.http.get<AdminGastosView>(`${this.base}/admin`);
  }

  getLista(params: ListaGastosParams = {}): Observable<ListaGastosResponse> {
    let httpParams = new HttpParams();
    if (params.mes) httpParams = httpParams.set('mes', params.mes);
    if (params.tecnicoId != null) {
      httpParams = httpParams.set('tecnicoId', String(params.tecnicoId));
    }
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    return this.http.get<ListaGastosResponse>(`${this.base}/lista`, {
      params: httpParams,
    });
  }

  crearRendicion(form: FormData): Observable<RendicionGasto> {
    return this.http.post<RendicionGasto>(this.base, form);
  }

  decidir(id: number, payload: DecidirGastoPayload): Observable<RendicionGasto> {
    return this.http.patch<RendicionGasto>(`${this.base}/${id}/decidir`, payload);
  }
}
