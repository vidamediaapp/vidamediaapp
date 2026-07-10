import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


import { AppStore } from './app.store';
import {
  Acreedor, Deuda, Presupuesto,
  SimulacionResult, SimulacionDto, AnalisisFinanciero,
  CreateDeudaDto, CreatePresupuestoDto,
  LoginDto, RegistroDto, AuthResponse,
} from '../models/app.model';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private http  = inject(HttpClient);
  private store = inject(AppStore);

  // ── AUTH ───────────────────────────────────────────────────────
  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, dto).pipe(
      catchError(this.handleError),
    );
  }

  registro(dto: RegistroDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/registro`, dto).pipe(
      catchError(this.handleError),
    );
  }

  // ── ACREEDORES ─────────────────────────────────────────────────
  getAcreedores(): Observable<Acreedor[]> {
    return this.http.get<Acreedor[]>(`${API}/acreedores`).pipe(
      tap(list => this.store.setAcreedores(list)),
      catchError(this.handleError),
    );
  }

  // ── DEUDAS ─────────────────────────────────────────────────────
  getDeudas(): Observable<Deuda[]> {
    return this.http.get<Deuda[]>(`${API}/deudas`).pipe(
      tap(list => this.store.setDeudas(list)),
      catchError(this.handleError),
    );
  }

  createDeuda(dto: CreateDeudaDto): Observable<Deuda> {
    return this.http.post<Deuda>(`${API}/deudas`, dto).pipe(
      tap(deuda => this.store.upsertDeuda(deuda)),
      catchError(this.handleError),
    );
  }

  updateDeuda(id: string, dto: Partial<CreateDeudaDto>): Observable<Deuda> {
    return this.http.patch<Deuda>(`${API}/deudas/${id}`, dto).pipe(
      tap(deuda => this.store.upsertDeuda(deuda)),
      catchError(this.handleError),
    );
  }

  deleteDeuda(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/deudas/${id}`).pipe(
      tap(() => this.store.removeDeuda(id)),
      catchError(this.handleError),
    );
  }

  // ── PRESUPUESTO ────────────────────────────────────────────────
  getPresupuesto(mes: number, año: number): Observable<Presupuesto> {
    return this.http.get<Presupuesto>(`${API}/presupuesto?mes=${mes}&año=${año}`).pipe(
      tap(p => this.store.setPresupuesto(p)),
      catchError(this.handleError),
    );
  }

  savePresupuesto(dto: CreatePresupuestoDto): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${API}/presupuesto`, dto).pipe(
      tap(p => this.store.setPresupuesto(p)),
      catchError(this.handleError),
    );
  }

  // ── SIMULACIÓN ─────────────────────────────────────────────────
  simular(dto: SimulacionDto): Observable<SimulacionResult> {
    return this.http.post<SimulacionResult>(`${API}/simulator/project`, dto).pipe(
      catchError(this.handleError),
    );
  }

  // ── ANÁLISIS FINANCIERO ────────────────────────────────────────
  getAnalisis(): Observable<AnalisisFinanciero> {
    return this.http.get<AnalisisFinanciero>(`${API}/analisis`).pipe(
      tap(a => this.store.setAnalisis(a)),
      catchError(this.handleError),
    );
  }

  // ── Error handler ──────────────────────────────────────────────
  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg = 'Error al conectar con el servidor';
    if (err.status === 0)   msg = 'Servidor no disponible en localhost:3000';
    if (err.status === 400) msg = err.error?.message ?? 'Datos inválidos';
    if (err.status === 401) msg = 'Sesión expirada. Por favor inicia sesión nuevamente.';
    if (err.status === 404) msg = 'Recurso no encontrado';
    if (err.status === 409) msg = 'El registro ya existe';
    if (err.status >= 500)  msg = 'Error del servidor. Intenta más tarde.';
    return throwError(() => ({ status: err.status, message: msg }));
  }
}
