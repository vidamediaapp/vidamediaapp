import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

const API_URL     = 'http://localhost:3000/api';
const SESSION_KEY = 'vm_session';

// ── DTOs ──────────────────────────────────────────────────────────
export interface LoginDto {
  email:    string;
  password: string;
}

export interface RegistroDto {
  rut:          string;
  email:        string;
  nombre:       string;
  apellidoPat:  string;
  apellidoMat?: string;
  telefono:     string;
  password:     string;
}

// ── Respuesta del backend ─────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  user: {
    id:          string;
    email:       string;
    nombre:      string;
    apellidoPat: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  // ── Estado reactivo con Signals ───────────────────────────────────
  private _session = signal<AuthResponse | null>(null);

  readonly isLoggedIn  = computed(() => !!this._session());
  readonly currentUser = computed(() => this._session()?.user ?? null);
  readonly token       = computed(() => this._session()?.accessToken ?? null);

  constructor() {
    // Restaurar sesión guardada al abrir la app
    this.restoreSession();
  }

  // ── Login → POST /api/auth/login ─────────────────────────────────
  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, dto).pipe(
      tap(res => this.saveSession(res)),
      catchError(this.handleError),
    );
  }

  // ── Registro → POST /api/auth/registro ───────────────────────────
  registro(dto: RegistroDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/registro`, dto).pipe(
      tap(res => this.saveSession(res)),
      catchError(this.handleError),
    );
  }

  // ── Cerrar sesión ─────────────────────────────────────────────────
  logout(): void {
    this._session.set(null);
    Preferences.remove({ key: SESSION_KEY });
  }

  // ── Guardar sesión en Capacitor Preferences ───────────────────────
  private async saveSession(res: AuthResponse): Promise<void> {
    this._session.set(res);
    await Preferences.set({ key: SESSION_KEY, value: JSON.stringify(res) });
  }

  // ── Restaurar sesión al abrir la app ─────────────────────────────
  private async restoreSession(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: SESSION_KEY });
      if (value) this._session.set(JSON.parse(value));
    } catch {
      // Sesión corrupta — ignorar
    }
  }

  // ── Manejo de errores HTTP ────────────────────────────────────────
  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg = 'Error al conectar con el servidor';

    if (err.status === 0)   msg = 'No se pudo conectar. Verifica que el servidor esté activo en localhost:3000';
    if (err.status === 400) msg = err.error?.message ?? 'Datos inválidos. Revisa el formulario.';
    if (err.status === 401) msg = 'Correo o contraseña incorrectos.';
    if (err.status === 409) msg = 'El correo o RUT ya está registrado.';
    if (err.status === 422) msg = err.error?.message ?? 'Datos inválidos.';
    if (err.status >= 500)  msg = 'Error del servidor. Intenta más tarde.';

    return throwError(() => ({ status: err.status, message: msg }));
  }
}
