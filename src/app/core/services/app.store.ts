import { Injectable, signal, computed } from '@angular/core';
import {
  Deuda, Presupuesto, AnalisisFinanciero,
  StreakInfo, Achievement, Acreedor,
} from '../models/app.model';

const UI_MAP: Record<string, { color: string; iconName: string }> = {
  falabella:   { color: '#E24B4A', iconName: 'card-outline' },
  ripley:      { color: '#EF9F27', iconName: 'card-outline' },
  cajaAndes:   { color: '#378ADD', iconName: 'business-outline' },
  bancoEstado: { color: '#1D9E75', iconName: 'card-outline' },
};

@Injectable({ providedIn: 'root' })
export class AppStore {

  private readonly _deudas      = signal<Deuda[]>([]);
  private readonly _presupuesto = signal<Presupuesto | null>(null);
  private readonly _analisis    = signal<AnalisisFinanciero | null>(null);
  private readonly _acreedores  = signal<Acreedor[]>([]);

  readonly deudas      = this._deudas.asReadonly();
  readonly presupuesto = this._presupuesto.asReadonly();
  readonly analisis    = this._analisis.asReadonly();
  readonly acreedores  = this._acreedores.asReadonly();

  // ── Totales de deuda ──────────────────────────────────────────
  readonly totalOriginal = computed(() =>
    this._deudas().reduce((s, d) => s + (Number(d.monto_original) || 0), 0));

  readonly totalSaldo = computed(() =>
    this._deudas().reduce((s, d) => s + (Number(d.saldo_pendiente) || 0), 0));

  readonly totalPagado = computed(() =>
    this.totalOriginal() - this.totalSaldo());

  readonly freedomPercent = computed(() => {
    const orig = this.totalOriginal();
    if (orig <= 0 || isNaN(orig)) return 0;
    const pct = Math.round((this.totalPagado() / orig) * 100);
    return isNaN(pct) ? 0 : pct;
  });

  // ── Presupuesto ───────────────────────────────────────────────
  readonly totalIncome = computed((): number => {
    const p = this._presupuesto();
    if (!p) return 0;
    return (Number(p.salario) || 0) + (Number(p.extras) || 0);
  });

  readonly totalCommitted = computed((): number => {
    const p = this._presupuesto();
    if (!p || !p.pagosPlanificados) return 0;
    const valores = Object.values(p.pagosPlanificados);
    return valores.reduce((s: number, v: any) => s + (Number(v) || 0), 0);
  });

  readonly available = computed((): number =>
    this.totalIncome() - this.totalCommitted());

  readonly availablePercent = computed((): number => {
    const inc = this.totalIncome();
    return inc > 0 ? Math.round((this.available() / inc) * 100) : 0;
  });

  // ── Distribución ──────────────────────────────────────────────
  readonly distribution = computed(() => {
    const total = this.totalSaldo();
    if (total <= 0) return [];
    return this._deudas().map((d: Deuda) => ({
      name:    d.acreedor.nombreComercial,
      color:   UI_MAP[d.acreedor.id]?.color ?? '#6b7280',
      balance: Number(d.saldo_pendiente) || 0,
      percent: total > 0 ? Math.round(((Number(d.saldo_pendiente) || 0) / total) * 100) : 0,
    }));
  });

  // ── Próximo vencimiento ───────────────────────────────────────
  readonly nextDue = computed(() => {
    const pendientes = this._deudas().filter((d: Deuda) => d.estado !== 'pagada');
    if (!pendientes.length) return null;
    return [...pendientes].sort((a: Deuda, b: Deuda) =>
      new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime())[0];
  });

  readonly hasData = computed(() =>
    this._deudas().length > 0 || this._presupuesto() !== null);

  // ── Racha ─────────────────────────────────────────────────────
  readonly streak = computed<StreakInfo>(() => ({
    currentStreak: 5,
    longestStreak: 5,
    months: [
      { label: 'ENE', onTime: true  },
      { label: 'FEB', onTime: true  },
      { label: 'MAR', onTime: true  },
      { label: 'ABR', onTime: true  },
      { label: 'MAY', onTime: true  },
      { label: 'JUN', onTime: false },
      { label: 'JUL', onTime: false },
    ],
  }));

  // ── Logros ────────────────────────────────────────────────────
  readonly achievements = computed<Achievement[]>(() => {
    const paidOff = this._deudas().some((d: Deuda) => Number(d.saldo_pendiente) === 0);
    return [
      { label: '1er registro',  icon: 'ribbon-outline',  earned: this.hasData()                          },
      { label: '3 meses',       icon: 'flame-outline',   earned: this.streak().currentStreak >= 3        },
      { label: 'Deuda saldada', icon: 'medal-outline',   earned: paidOff                                 },
      { label: 'Año sin mora',  icon: 'ribbon-outline',  earned: this.streak().longestStreak >= 12       },
    ];
  });

  // ── Mutaciones ────────────────────────────────────────────────
  setDeudas(list: Deuda[]): void           { this._deudas.set(list);       }
  setPresupuesto(p: Presupuesto | null): void { this._presupuesto.set(p as any); }
  setAnalisis(a: AnalisisFinanciero): void  { this._analisis.set(a);        }
  setAcreedores(list: Acreedor[]): void     { this._acreedores.set(list);   }

  upsertDeuda(deuda: Deuda): void {
    this._deudas.update(list => {
      const idx = list.findIndex((d: Deuda) => d.id === deuda.id);
      return idx >= 0
        ? list.map((d: Deuda, i: number) => i === idx ? deuda : d)
        : [...list, deuda];
    });
  }

  removeDeuda(id: string): void {
    this._deudas.update(list => list.filter((d: Deuda) => d.id !== id));
  }

  // ── Helpers UI ────────────────────────────────────────────────
  creditorColor(id: string): string { return UI_MAP[id]?.color    ?? '#6b7280';           }
  creditorIcon(id: string):  string { return UI_MAP[id]?.iconName ?? 'business-outline';  }
  creditorName(id: string):  string {
    const found = this._acreedores().find((a: Acreedor) => a.id === id);
    return found?.nombreComercial ?? id;
  }

  debtPct(d: Deuda): number {
    const monto = Number(d.monto_original) || 0;
    if (monto === 0) return 0;
    const pct = Math.round(((monto - (Number(d.saldo_pendiente) || 0)) / monto) * 100);
    return isNaN(pct) ? 0 : pct;
  }

  formatClp(n: number): string {
    if (isNaN(n) || n === null || n === undefined) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }
}