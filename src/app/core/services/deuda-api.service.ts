import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Deuda, CreateDeudaDto, Acreedor } from '../models/app.model';

// ── URL base del backend de Diego ─────────────────────────────────
const API_URL = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class DeudaApiService {

  private http = inject(HttpClient);

  // ── Acreedores ────────────────────────────────────────────────────
  getAcreedores(): Observable<Acreedor[]> {
    return this.http.get<Acreedor[]>(`${API_URL}/acreedores`).pipe(
      catchError(this.handleError),
    );
  }

  // ── Deudas ────────────────────────────────────────────────────────
  getDeudas(): Observable<Deuda[]> {
    return this.http.get<Deuda[]>(`${API_URL}/deudas`).pipe(
      catchError(this.handleError),
    );
  }

  getDeudaById(id: string): Observable<Deuda> {
    return this.http.get<Deuda>(`${API_URL}/deudas/${id}`).pipe(
      catchError(this.handleError),
    );
  }

  createDeuda(dto: CreateDeudaDto): Observable<Deuda> {
    return this.http.post<Deuda>(`${API_URL}/deudas`, dto).pipe(
      catchError(this.handleError),
    );
  }

  updateDeuda(id: string, dto: Partial<CreateDeudaDto>): Observable<Deuda> {
    return this.http.patch<Deuda>(`${API_URL}/deudas/${id}`, dto).pipe(
      catchError(this.handleError),
    );
  }

  deleteDeuda(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/deudas/${id}`).pipe(
      catchError(this.handleError),
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────
  /** Calcula el pago mínimo mensual según porcentaje_pago_minimo del backend */
  calcPagoMinimo(deuda: Deuda): number {
    return Math.ceil(deuda.saldo_pendiente * (deuda.porcentaje_pago_minimo / 100));
  }

  /** Días restantes hasta fecha_limite */
  diasParaVencer(deuda: Deuda): number {
    const hoy   = new Date();
    const limite = new Date(deuda.fecha_limite);
    const diff  = Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  /** Estado de color según estado y días restantes */
  colorEstado(deuda: Deuda): string {
    if (deuda.estado === 'pagada')  return '#1D9E75';
    if (deuda.estado === 'vencida') return '#E24B4A';
    const dias = this.diasParaVencer(deuda);
    if (dias <= 5) return '#E24B4A';   // urgente
    if (dias <= 10) return '#EF9F27';  // advertencia
    return '#378ADD';                  // normal
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let msg = 'Error al conectar con el servidor';
    if (error.status === 0)   msg = 'No se pudo conectar. Verifica que el servidor esté activo.';
    if (error.status === 404) msg = 'Recurso no encontrado.';
    if (error.status === 422) msg = 'Datos inválidos. Revisa el formulario.';
    if (error.status >= 500)  msg = 'Error del servidor. Intenta más tarde.';
    return throwError(() => ({ status: error.status, message: msg }));
  }
}
