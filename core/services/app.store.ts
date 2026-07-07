import { Injectable, signal, computed } from '@angular/core';
import {
  Deuda, Presupuesto, AnalisisFinanciero,
  StreakInfo, Achievement, Acreedor,
} from '../models/app.model';

// Color e ícono por acreedor (UI only — no viene del backend)
const UI_MAP: Record<string, { color: string; iconName: string }> = {
  falabella:   { color: '#E24B4A', iconName: 'storefront-outline'   },
  ripley:      { color: '#EF9F27', iconName: 'cart-outline'         },
  cajaAndes:   { color: '#378ADD', iconName: 'business-outline'     },
  bancoEstado: { color: '#1D9E75', iconName: 'card-outline'         },
};

function uiColor(id: string):    string { return UI_MAP[id]?.color    ?? '#6b7280'; }
function uiIcon(id: string):     string { return UI_MAP[id]?.iconName ?? 'business-outline'; }

@Injectable({ providedIn: 'root' })
export class AppStore {

  // ── Estado base ────────────────────────────────────────────────
  private readonly _deudas      = signal<Deuda[]>([]);
  private readonly _presupuesto = signal<Presupuesto | null>(null);
  private readonly _analisis    = signal<AnalisisFinanciero | null>(null);
  private readonly _acreedores  = signal<Acreedor[]>([]);

  // ── Lectura pública ────────────────────────────────────────────
  readonly deudas      = this._deudas.asReadonly();
  readonly presupuesto = this._presupuesto.asReadonly();
  readonly analisis    = this._analisis.asReadonly();
  readonly acreedores  = this._acreedores.asReadonly();

  // ── Computed: totales ──────────────────────────────────────────
  readonly totalOriginal = computed(() =>
    this._deudas().reduce((s, d) => s + d.monto_original, 0));

  readonly totalSaldo = computed(() =>
    this._deudas().reduce((s, d) => s + d.saldo_pendiente, 0));

  readonly totalPagado = computed(() =>
    this.totalOriginal() - this.totalSaldo());

  readonly freedomPercent = computed(() => {
    const orig = this.totalOriginal();
    return orig > 0 ? Math.round((this.totalPagado() / orig) * 100) : 0;
  });

  // ── Computed: presupuesto ──────────────────────────────────────
  readonly totalIncome = computed(() => {
    const p = this._presupuesto();
    return p ? p.salario + p.extras : 0;
  });

  readonly totalCommitted = computed(() => {
    const p = this._presupuesto();
    if (!p) return 0;
    return Object.values(p.pagosPlanificados).reduce((s, v) => s + v, 0);
  });

  readonly available = computed(() =>
    this.totalIncome() - this.totalCommitted());

  readonly availablePercent = computed(() => {
    const inc = this.totalIncome();
    return inc > 0 ? Math.round((this.available() / inc) * 100) : 0;
  });

  // ── Computed: distribución por acreedor ───────────────────────
  readonly distribution = computed(() => {
    const total = this.totalSaldo();
    return this._deudas().map(d => ({
      name:    d.acreedor.nombreComercial,
      color:   uiColor(d.acreedor.id),
      balance: d.saldo_pendiente,
      percent: total > 0 ? Math.round((d.saldo_pendiente / total) * 100) : 0,
    }));
  });

  // ── Computed: alerta de ratio deuda/ingreso ───────────────────
  readonly ratioAlert = computed(() => {
    const analisis = this._analisis();
    if (analisis) return analisis;
    // Cálculo local mientras no hay respuesta del backend
    const ingreso = this.totalIncome();
    const ratio   = ingreso > 0 ? this.totalSaldo() / ingreso : 0;
    return {
      ratioDeudaIngreso:         Math.round(ratio * 10) / 10,
      nivelRiesgo:               ratio > 3 ? 'critico' : ratio > 2 ? 'alto' : ratio > 1 ? 'medio' : 'bajo',
      recomendaciones:           [] as string[],
      beneficiosDisponibles:     [] as string[],
      puedeSolicitarInsolvencia: ratio > 2,
    } as AnalisisFinanciero;
  });

  // ── Computed: próximo vencimiento ─────────────────────────────
  readonly nextDue = computed(() => {
    const pendientes = this._deudas().filter(d => d.estado !== 'pagada');
    if (!pendientes.length) return null;
    return [...pendientes].sort((a, b) =>
      new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime())[0];
  });

  // ── Computed: ¿hay datos? ─────────────────────────────────────
  readonly hasData = computed(() =>
    this._deudas().length > 0 || this._presupuesto() !== null);

  // ── Racha de pagos (mock hasta que el backend la provea) ──────
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
    const streak   = this.streak();
    const paidOff  = this._deudas().some(d => d.saldo_pendiente === 0);
    return [
      { label: '1er registro',  icon: 'medal-outline',  earned: this.hasData() },
      { label: '3 meses',       icon: 'flame-outline',  earned: streak.currentStreak >= 3 },
      { label: 'Deuda saldada', icon: 'trophy-outline', earned: paidOff },
      { label: 'Año sin mora',  icon: 'star-outline',   earned: streak.longestStreak >= 12 },
    ];
  });

  // ── Mutaciones (llamadas desde los servicios API) ─────────────
  setDeudas(deudas: Deuda[]): void {
    this._deudas.set(deudas);
  }

  setPresupuesto(p: Presupuesto): void {
    this._presupuesto.set(p);
  }

  setAnalisis(a: AnalisisFinanciero): void {
    this._analisis.set(a);
  }

  setAcreedores(list: Acreedor[]): void {
    this._acreedores.set(list);
  }

  upsertDeuda(deuda: Deuda): void {
    this._deudas.update(list => {
      const idx = list.findIndex(d => d.id === deuda.id);
      return idx >= 0 ? list.map((d, i) => i === idx ? deuda : d) : [...list, deuda];
    });
  }

  removeDeuda(id: string): void {
    this._deudas.update(list => list.filter(d => d.id !== id));
  }

  // ── Helpers UI ────────────────────────────────────────────────
  creditorColor(id: string):    string { return uiColor(id);  }
  creditorIcon(id: string):     string { return uiIcon(id);   }
  creditorName(acreedorId: string): string {
    const found = this._acreedores().find(a => a.id === acreedorId);
    return found?.nombreComercial ?? acreedorId;
  }

  debtPct(deuda: Deuda): number {
    if (deuda.monto_original === 0) return 0;
    return Math.round(((deuda.monto_original - deuda.saldo_pendiente) / deuda.monto_original) * 100);
  }

  // Costo real mensual incluyendo mantención, seguros y comisiones
  costoRealMensual(deuda: Deuda): number {
    return (deuda.mantencion ?? 0) + (deuda.seguros ?? 0) + (deuda.comisiones ?? 0);
  }

  formatClp(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }
}
