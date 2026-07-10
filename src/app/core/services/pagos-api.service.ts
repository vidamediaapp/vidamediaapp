import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export interface PagoResponse {
  id: string;
  monto: number;
  fechaPago: string;
  deuda: {
    id: string;
    acreedor: {
      id: string;
      nombreComercial: string;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class PagosApiService {

  private http = inject(HttpClient);

  registrarPago(deudaId: string, monto: number): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${API}/pagos/deudas/${deudaId}/pagos`, { monto });
  }

  obtenerPagos(deudaId: string): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${API}/pagos/deudas/${deudaId}/pagos`);
  }

  obtenerTodosPagos(): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${API}/pagos`);
  }

  eliminarPago(pagoId: string, deudaId: string): Observable<void> {
    return this.http.delete<void>(`${API}/pagos/deudas/${deudaId}/pagos/${pagoId}`);
}
}