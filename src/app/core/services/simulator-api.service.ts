import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectDto, ProjectResponse } from '../models/simulator.model';

const API_URL = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class SimulatorApiService {

  private http = inject(HttpClient);

  /**
   * POST /simulator/project
   * Envía los datos de una deuda al backend y recibe la proyección calculada.
   * Si el backend no está disponible, el componente usa el cálculo local.
   */
  project(dto: ProjectDto): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(`${API_URL}/simulator/project`, dto).pipe(
      catchError(this.handleError),
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg = 'No se pudo conectar al servidor de simulación.';
    if (err.status === 0)   msg = 'Servidor no disponible. Usando cálculo local.';
    if (err.status >= 500)  msg = 'Error del servidor.';
    return throwError(() => ({ status: err.status, message: msg }));
  }
}
