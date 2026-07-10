import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProjectDto, ProjectResponse } from '../models/simulator.model';

const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class SimulatorApiService {

  private http = inject(HttpClient);

  project(dto: ProjectDto): Observable<ProjectResponse> {
    const payload = {
      deudaId: dto.debtId,
      montoPropuesto: dto.monthlyPayment,
      extraPayment: dto.extraPayment || 0
    };
    return this.http.post<ProjectResponse>(`${API_URL}/simulaciones`, payload).pipe(
      catchError(this.handleError),
    );
  }

  guardarSimulacion(data: { deudaId: string; montoPropuesto: number; resultado: any }): Observable<any> {
    return this.http.post(`${API_URL}/simulaciones/guardar`, data).pipe(
      catchError(this.handleError),
    );
  }

 getHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/simulaciones/historial`).pipe(
      catchError(this.handleError),
    );
}

  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg = 'No se pudo conectar al servidor de simulacion.';
    if (err.status === 0)   msg = 'Servidor no disponible. Usando calculo local.';
    if (err.status >= 500)  msg = 'Error del servidor.';
    return throwError(() => ({ status: err.status, message: msg }));
  }
}