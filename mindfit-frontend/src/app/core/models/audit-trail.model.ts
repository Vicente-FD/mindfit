export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface AuditTrailItem {
  id: string;
  timeStamp: string;
  tableName: string;
  rowPk: string;
  operation: AuditOperation;
  userId: number | null;
  usuarioNombre: string | null;
  mensaje: string;
}

export interface AuditTrailResponse {
  data: AuditTrailItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditTrailFilters {
  page?: number;
  limit?: number;
  tableName?: string;
}
