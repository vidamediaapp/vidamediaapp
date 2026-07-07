import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { LoginDto, RegistroDto, AuthResponse, Usuario } from '../models/app.model';

const API         = 'http://localhost:3000/api';
const SESSION_KEY = 'vm_session';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  private _session = signal<AuthResponse | null>(null);

  readonly isLoggedIn  = computed(() => !!this._session());
  readonly currentUser = computed(() => this._session()?.user ?? null);
  readonly token       = computed(() => this._session()?.accessToken ?? null);

  // Campos del Usuario de Diego accesibles directo
  readonly userId       = computed(() => this._session()?.user?.id ?? null);
  readonly userNombre   = computed(() => this._session()?.user?.nombre ?? null);
  readonly userApaterno = computed(() => this._session()?.user?.apaterno ?? null);
  readonly userRut      = computed(() => this._session()?.user?.rut ?? null);
  readonly userIncome   = computed(() => this._session()?.user?.monthlyIncome ?? 0);

  // Nombre completo calculado
  readonly fullName = computed(() => {
    const u = this._session()?.user;
    if (!u) return null;
    return `${u.nombre} ${u.apaterno} ${u.amaterno ?? ''}`.trim();
  });

  constructor() {
    this.restoreSession();
  }

  // ── Login → POST /api/auth/login ──────────────────────────────
  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, dto).pipe(
      tap(res => this.saveSession(res)),
      catchError(this.handleError),
    );
  }

  // ── Registro → POST /api/auth/registro ───────────────────────
  registro(dto: RegistroDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/registro`, dto).pipe(
      tap(res => this.saveSession(res)),
      catchError(this.handleError),
    );
  }

  logout(): void {
    this._session.set(null);
    Preferences.remove({ key: SESSION_KEY });
  }

  private async saveSession(res: AuthResponse): Promise<void> {
    this._session.set(res);
    await Preferences.set({ key: SESSION_KEY, value: JSON.stringify(res) });
  }

  private async restoreSession(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: SESSION_KEY });
      if (value) this._session.set(JSON.parse(value));
    } catch { /* sesión corrupta */ }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg = 'Error al conectar con el servidor';
    if (err.status === 0)   msg = 'Servidor no disponible. Verifica que el backend esté corriendo.';
    if (err.status === 400) msg = err.error?.message ?? 'Datos inválidos.';
    if (err.status === 401) msg = 'Correo o contraseña incorrectos.';
    if (err.status === 409) msg = 'El correo o RUT ya está registrado.';
    if (err.status >= 500)  msg = 'Error del servidor. Intenta más tarde.';
    return throwError(() => ({ status: err.status, message: msg }));
  }
}
