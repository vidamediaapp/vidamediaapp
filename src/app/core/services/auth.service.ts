import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';
import { LoginDto, RegistroDto, AuthResponse } from '../models/app.model';

const API         = environment.apiUrl;
const SESSION_KEY = 'vm_session';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  private _session = signal<AuthResponse | null>(null);

  readonly isLoggedIn  = computed(() => !!this._session());
  readonly currentUser = computed(() => this._session()?.usuario ?? null);
  readonly token       = computed(() => this._session()?.token ?? null);
  readonly userId      = computed(() => this._session()?.usuario?.id ?? null);
  readonly userNombre  = computed(() => this._session()?.usuario?.nombre ?? null);
  readonly fullName    = computed(() => {
    const u = this._session()?.usuario;
    if (!u) return null;
    return `${u.nombre} ${u.apaterno} ${u.amaterno ?? ''}`.trim();
  });

  constructor() {}


  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, dto).pipe(
      tap(res => this.saveSession(res)),
      catchError(this.handleError),
    );
  }

  
  register(dto: RegistroDto): Observable<AuthResponse> {
    const payload = {
      email: dto.email,
      password: dto.password,
      nombre: dto.nombre,
      apellidoPat: dto.apaterno,
      apellidoMat: dto.amaterno || '',
      telefono: dto.telefono,
      rut: dto.rut,
    };
    return this.http.post<AuthResponse>(`${API}/auth/register`, payload).pipe(
      tap(res => this.saveSession(res)),
      catchError(this.handleError),
    );
  }

  logout(): void {
    this._session.set(null);
    Preferences.remove({ key: SESSION_KEY });
  }

  private async saveSession(res: AuthResponse): Promise<void> {
    if (res.usuario) {

      if (!res.usuario.apaterno && (res.usuario as any).apellidoPat) {
        res.usuario.apaterno = (res.usuario as any).apellidoPat;
      }
      if (!res.usuario.amaterno && (res.usuario as any).apellidoMat) {
        res.usuario.amaterno = (res.usuario as any).apellidoMat;
      }
    }
    
    this._session.set(res);
    await Preferences.set({ key: SESSION_KEY, value: JSON.stringify(res) });
  }

  async init(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: SESSION_KEY });
      if (value) {
        const parsed = JSON.parse(value);
        if (parsed.accessToken && !parsed.token) parsed.token = parsed.accessToken;
        if (parsed.user && !parsed.usuario) parsed.usuario = parsed.user;
        
        // Normalizar nombres de usuario en sesión recuperada
        if (parsed.usuario) {
          if (!parsed.usuario.apaterno && parsed.usuario.apellidoPat) {
            parsed.usuario.apaterno = parsed.usuario.apellidoPat;
          }
          if (!parsed.usuario.amaterno && parsed.usuario.apellidoMat) {
            parsed.usuario.amaterno = parsed.usuario.apellidoMat;
          }
        }
        
        this._session.set(parsed);
      }
    } catch { /* sesión corrupta */ }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg = 'Error al conectar con el servidor';
    if (err.status === 0)   msg = 'Servidor no disponible. Verifica que el backend esté activo.';
    if (err.status === 400) msg = err.error?.message ?? 'Datos inválidos.';
    if (err.status === 401) msg = 'Correo o contraseña incorrectos.';
    if (err.status === 409) msg = 'El correo o RUT ya está registrado.';
    if (err.status >= 500)  msg = 'Error del servidor. Intenta más tarde.';
    return throwError(() => ({ status: err.status, message: msg }));
  }
}