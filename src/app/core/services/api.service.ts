import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppStore } from './app.store';
import {
  Acreedor, Deuda, Presupuesto,
  SimulacionResult, SimulacionDto, AnalisisFinanciero,
  CreateDeudaDto, CreatePresupuestoDto,
} from '../models/app.model';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {

  private http  = inject(HttpClient);
  private store = inject(AppStore);

  // ── Acreedores ─────────────────────────────────────────────────
  getAcreedores(): Observable<Acreedor[]> {
    return this.http.get<Acreedor[]>(`${API}/acreedores`).pipe(
      tap(list => this.store.setAcreedores(list)),
      catchError(this.handleError),
    );
  }

  // ── Deudas ─────────────────────────────────────────────────────
  getDeudas(): Observable<Deuda[]> {
    return this.http.get<Deuda[]>(`${API}/deudas`).pipe(
      tap(list => this.store.setDeudas(list)),
      catchError(this.handleError),
    );
  }

  createDeuda(dto: CreateDeudaDto): Observable<Deuda> {
    return this.http.post<Deuda>(`${API}/deudas`, dto).pipe(
      tap(d => this.store.upsertDeuda(d)),
      catchError(this.handleError),
    );
  }

  updateDeuda(id: string, dto: Partial<CreateDeudaDto>): Observable<Deuda> {
    return this.http.put<Deuda>(`${API}/deudas/${id}`, dto).pipe(
      tap(d => this.store.upsertDeuda(d)),
      catchError(this.handleError),
    );
  }

  deleteDeuda(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/deudas/${id}`).pipe(
      tap(() => this.store.removeDeuda(id)),
      catchError(this.handleError),
    );
  }

  // ── Presupuesto ────────────────────────────────────────────────
  getPresupuesto(mes: number, año: number): Observable<Presupuesto | null> {
    return this.http.get<Presupuesto>(`${API}/presupuesto/${mes}/${año}`).pipe(
      tap(p => this.store.setPresupuesto(p)),
      catchError(err => {
        if (err.status === 404) {
          this.store.setPresupuesto(null as any);
          return of(null);
        }
        return this.handleError(err);
      }),
    );
  }

  savePresupuesto(dto: CreatePresupuestoDto): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${API}/presupuesto`, dto).pipe(
      tap(p => this.store.setPresupuesto(p)),
      catchError(this.handleError),
    );
  }

  // ── Simulación ─────────────────────────────────────────────────
  simular(dto: SimulacionDto): Observable<SimulacionResult> {
    return this.http.post<SimulacionResult>(`${API}/simulaciones`, dto).pipe(
      catchError(this.handleError),
    );
}

  // ── Análisis financiero ────────────────────────────────────────
  getAnalisis(): Observable<AnalisisFinanciero> {
    return this.http.get<AnalisisFinanciero>(`${API}/analisis`).pipe(
      tap(a => this.store.setAnalisis(a)),
      catchError(this.handleError),
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg = 'Error al conectar con el servidor';
    if (err.status === 0)   msg = 'Servidor no disponible.';
    if (err.status === 400) msg = err.error?.message ?? 'Datos inválidos.';
    if (err.status === 401) msg = 'Sesión expirada. Inicia sesión nuevamente.';
    if (err.status === 404) msg = 'Recurso no encontrado.';
    if (err.status === 409) msg = 'El registro ya existe.';
    if (err.status >= 500)  msg = 'Error del servidor. Intenta más tarde.';
    return throwError(() => ({ status: err.status, message: msg }));
  }
}
