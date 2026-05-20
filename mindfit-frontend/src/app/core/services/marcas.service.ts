import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Marca } from '../models/marca.model';

@Injectable({ providedIn: 'root' })
export class MarcasService {
  private readonly baseUrl = `${environment.apiUrl}/marcas`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.baseUrl);
  }
}
