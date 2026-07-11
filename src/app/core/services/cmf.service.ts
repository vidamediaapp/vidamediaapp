import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export interface CmfUfResponse {
    valor: number;
    fecha: string;
}

@Injectable({ providedIn: 'root' })
export class CmfService {
    private http = inject(HttpClient);

    obtenerUF(): Observable<CmfUfResponse> {
        return this.http.get<CmfUfResponse>(`${API}/cmf/uf`);
    }
}