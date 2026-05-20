import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkOrderPriority } from '../models/work-order.model';
import {
  CloseWorkOrderPayload,
  UpdateWorkOrderStatusPayload,
  WorkOrder,
} from '../models/work-order.model';

export interface CreateWorkOrderPayload {
  activoId?: number;
  sucursalId: number;
  titulo: string;
  descripcion?: string;
  prioridad?: WorkOrderPriority;
  tipoMantenimiento: 'correctivo' | 'preventivo';
  asignadoAId?: number;
}

export interface ReportarFallaPayload {
  activoId: number;
  descripcion: string;
  prioridad: WorkOrderPriority;
  titulo?: string;
  fotoFalla?: File;
}

@Injectable({ providedIn: 'root' })
export class WorkOrdersService {
  private readonly baseUrl = `${environment.apiUrl}/ordenes-trabajo`;

  constructor(private readonly http: HttpClient) {}

  getMisAsignadas(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(`${this.baseUrl}/mis-asignadas`);
  }

  updateEstado(
    id: number,
    payload: UpdateWorkOrderStatusPayload,
  ): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/${id}/estado`, payload);
  }

  iniciarTrabajo(id: number): Observable<WorkOrder> {
    return this.updateEstado(id, { estado: 'en_proceso' });
  }

  listAll(sucursalId?: number, tecnicoId?: number): Observable<WorkOrder[]> {
    let params = new HttpParams();
    if (sucursalId != null) params = params.set('sucursalId', String(sucursalId));
    if (tecnicoId != null) params = params.set('tecnicoId', String(tecnicoId));
    return this.http.get<WorkOrder[]>(this.baseUrl, { params });
  }

  getMiSucursal(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(`${this.baseUrl}/mi-sucursal`);
  }

  create(payload: CreateWorkOrderPayload): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(this.baseUrl, payload);
  }

  asignar(id: number, asignadoAId: number): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/${id}/asignar`, {
      asignadoAId,
    });
  }

  reportarFalla(payload: ReportarFallaPayload): Observable<WorkOrder> {
    const formData = new FormData();
    formData.append('activoId', String(payload.activoId));
    formData.append('descripcion', payload.descripcion);
    formData.append('prioridad', payload.prioridad);
    if (payload.titulo) formData.append('titulo', payload.titulo);
    if (payload.fotoFalla) {
      formData.append('foto_falla', payload.fotoFalla, payload.fotoFalla.name);
    }
    return this.http.post<WorkOrder>(
      `${this.baseUrl}/reportar-falla`,
      formData,
    );
  }

  cerrarOrden(id: number, payload: CloseWorkOrderPayload): Observable<WorkOrder> {
    const formData = new FormData();
    formData.append('comentario', payload.comentario);
    formData.append('fotos_antes', payload.fotosAntes, payload.fotosAntes.name);
    formData.append(
      'fotos_despues',
      payload.fotosDespues,
      payload.fotosDespues.name,
    );

    return this.http.post<WorkOrder>(`${this.baseUrl}/${id}/cerrar`, formData);
  }
}
