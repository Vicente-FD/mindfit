import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sucursal } from '../models/sucursal.model';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private readonly baseUrl = `${environment.apiUrl}/sucursales`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(this.baseUrl);
  }
}
