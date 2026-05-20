import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicAsset } from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private readonly baseUrl = `${environment.apiUrl}/activos`;

  constructor(private readonly http: HttpClient) {}

  getPublicByIdentifier(identifier: string): Observable<PublicAsset> {
    return this.http.get<PublicAsset>(
      `${this.baseUrl}/publico/${encodeURIComponent(identifier)}`,
    );
  }
}
