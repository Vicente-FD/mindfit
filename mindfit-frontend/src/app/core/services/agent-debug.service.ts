import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgentDebugService {
  private readonly http = inject(HttpClient);

  log(
    location: string,
    message: string,
    data: Record<string, unknown>,
    hypothesisId: string,
    runId = 'post-fix',
  ): void {
    this.http
      .post(`${environment.apiUrl}/debug/agent-log`, {
        location,
        message,
        data,
        hypothesisId,
        runId,
      })
      .subscribe({ error: () => undefined });
  }
}
