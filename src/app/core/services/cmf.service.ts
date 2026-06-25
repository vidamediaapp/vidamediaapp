import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CmfService {
  private readonly _uf = signal<number>(37_843.04);
  private readonly _lastUpdated = signal<string>(
    new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }),
  );

  readonly ufValue    = this._uf.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();

  toPesos(uf: number): number {
    return Math.round(uf * this._uf());
  }

  formatClp(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }
}
