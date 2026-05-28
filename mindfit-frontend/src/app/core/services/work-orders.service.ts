import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CalendarioOrdenesParams,
  CalendarioOrdenesResponse,
  ClasificacionOt,
  CloseWorkOrderPayload,
  ListWorkOrdersParams,
  UpdateWorkOrderStatusPayload,
  WorkOrder,
  WorkOrderPriority,
} from '../models/work-order.model';
import { TipoReporteSucursal } from '../models/tipo-reporte.model';
import {
  BulkCreateWorkOrdersResponse,
  BulkWorkOrderTask,
} from '../models/bulk-work-order.model';

export interface UpdateWorkOrderPayload {
  titulo?: string;
  descripcion?: string;
  prioridad?: WorkOrderPriority;
  clasificacion?: ClasificacionOt;
  activoId?: number | null;
  asignadoAId?: number | null;
}

export interface CreateWorkOrderPayload {
  clasificacion?: ClasificacionOt;
  activoId?: number;
  sucursalId: number;
  titulo: string;
  descripcion?: string;
  prioridad?: WorkOrderPriority;
  tipoMantenimiento: 'correctivo' | 'preventivo';
}

export interface ReportarFallaPayload {
  tipoReporte: TipoReporteSucursal;
  activoId?: number | null;
  descripcion: string;
  prioridad: WorkOrderPriority;
  titulo?: string;
  fotoFalla?: File;
  sucursalId?: number;
  asignadoAId?: number | null;
  areaServicios?: 'bano' | 'camarin' | 'ducha';
  generoServicios?: 'hombres' | 'mujeres';
  generosServicios?: Array<'hombres' | 'mujeres'>;
  fallaGeneralServicios?: boolean;
}

@Injectable({ providedIn: 'root' })
export class WorkOrdersService {
  private readonly baseUrl = `${environment.apiUrl}/ordenes-trabajo`;

  constructor(private readonly http: HttpClient) {}

  getMisAsignadas(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(`${this.baseUrl}/mis-asignadas`);
  }

  getById(id: number): Observable<WorkOrder> {
    return this.http.get<WorkOrder>(`${this.baseUrl}/${id}`);
  }

  updateEstado(
    id: number,
    payload: UpdateWorkOrderStatusPayload,
  ): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/${id}/estado`, payload);
  }

  iniciarTrabajo(id: number, fotoAntes: File): Observable<WorkOrder> {
    const formData = new FormData();
    const ext = fotoAntes.name?.split('.').pop() || 'jpg';
    formData.append('foto_antes', fotoAntes, fotoAntes.name || `antes.${ext}`);
    return this.http.post<WorkOrder>(
      `${this.baseUrl}/${id}/iniciar-trabajo`,
      formData,
    );
  }

  listAll(params: ListWorkOrdersParams = {}): Observable<WorkOrder[]> {
    let httpParams = new HttpParams();
    if (params.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }
    if (params.fechaInicio) {
      httpParams = httpParams.set('fecha_inicio', params.fechaInicio);
    }
    if (params.fechaFin) {
      httpParams = httpParams.set('fecha_fin', params.fechaFin);
    }
    if (params.sucursalId != null) {
      httpParams = httpParams.set('sucursalId', String(params.sucursalId));
    }
    if (params.tecnicoId != null) {
      httpParams = httpParams.set('tecnicoId', String(params.tecnicoId));
    }
    return this.http.get<WorkOrder[]>(this.baseUrl, { params: httpParams });
  }

  getCalendario(
    params: CalendarioOrdenesParams,
  ): Observable<CalendarioOrdenesResponse> {
    let httpParams = new HttpParams().set('mes', params.mes);
    if (params.sucursalId != null) {
      httpParams = httpParams.set('sucursalId', String(params.sucursalId));
    }
    return this.http.get<CalendarioOrdenesResponse>(
      `${this.baseUrl}/calendario`,
      { params: httpParams },
    );
  }

  getMiSucursal(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(`${this.baseUrl}/mi-sucursal`);
  }

  create(payload: CreateWorkOrderPayload): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(this.baseUrl, payload);
  }

  crearOrdenesEnLote(
    tasks: BulkWorkOrderTask[],
  ): Observable<BulkCreateWorkOrdersResponse> {
    return this.http.post<BulkCreateWorkOrdersResponse>(
      `${this.baseUrl}/bulk`,
      { tasks },
    );
  }

  asignar(id: number, tecnicoId: number): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/${id}/asignar`, {
      tecnicoId,
    });
  }

  update(id: number, payload: UpdateWorkOrderPayload): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reportarFalla(payload: ReportarFallaPayload): Observable<WorkOrder> {
    const formData = new FormData();
    formData.append('tipoReporte', payload.tipoReporte);
    formData.append('descripcion', payload.descripcion);
    formData.append('prioridad', payload.prioridad);
    if (payload.titulo) formData.append('titulo', payload.titulo);
    if (payload.sucursalId != null) {
      formData.append('sucursalId', String(payload.sucursalId));
    }
    if (payload.asignadoAId != null) {
      formData.append('asignadoAId', String(payload.asignadoAId));
    }
    if (payload.areaServicios) {
      formData.append('areaServicios', payload.areaServicios);
    }
    if (payload.generoServicios) {
      formData.append('generoServicios', payload.generoServicios);
    }
    if (payload.generosServicios?.length) {
      formData.append('generosServicios', payload.generosServicios.join(','));
    }
    if (payload.fallaGeneralServicios != null) {
      formData.append(
        'fallaGeneralServicios',
        payload.fallaGeneralServicios ? 'true' : 'false',
      );
    }
    if (payload.tipoReporte === 'maquina' && payload.activoId != null) {
      formData.append('activoId', String(payload.activoId));
    }
    if (payload.fotoFalla) {
      formData.append('foto_falla', payload.fotoFalla, payload.fotoFalla.name);
    }
    return this.http.post<WorkOrder>(
      `${this.baseUrl}/reportar-falla`,
      formData,
    );
  }

  aprobar(id: number): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/${id}/aprobar`, {});
  }

  rechazar(id: number, motivo: string): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/${id}/rechazar`, {
      motivo,
    });
  }

  revertirAprobacion(id: number): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(
      `${this.baseUrl}/${id}/revertir-aprobacion`,
      {},
    );
  }

  cerrarOrden(id: number, payload: CloseWorkOrderPayload): Observable<WorkOrder> {
    const formData = new FormData();
    formData.append('comentario', payload.comentario);
    formData.append(
      'foto_despues',
      payload.fotoDespues,
      payload.fotoDespues.name,
    );
    if (payload.repuestos?.length) {
      formData.append('repuestos', JSON.stringify(payload.repuestos));
    }

    return this.http.post<WorkOrder>(`${this.baseUrl}/${id}/cerrar`, formData);
  }
}
