import { Injectable, signal, computed } from '@angular/core';
import { BudgetMonth, DebtEntry, Achievement, StreakInfo } from '../models/app.model';
import { CREDITORS_SEED } from './creditors.seed';

@Injectable({ providedIn: 'root' })
export class AppStore {

  readonly creditors = CREDITORS_SEED;

  private readonly _budget = signal<BudgetMonth>({
    salary: 0,
    extras: 0,
    creditorPayments: {},
    debts: [],
  });

  private readonly _paymentsCount = signal<number>(0);

  readonly budget = this._budget.asReadonly();

  // ── Presupuesto ───────────────────────────────────────────────────
  readonly totalIncome = computed(() =>
    this._budget().salary + this._budget().extras);

  readonly totalCommitted = computed(() =>
    Object.values(this._budget().creditorPayments).reduce((s, v) => s + v, 0));

  readonly available = computed(() =>
    this.totalIncome() - this.totalCommitted());

  readonly availablePercent = computed(() => {
    const inc = this.totalIncome();
    return inc > 0 ? Math.round((this.available() / inc) * 100) : 0;
  });

  // ── Totales de deuda (para home) ──────────────────────────────────
  readonly totalOriginal = computed(() =>
    this._budget().debts.reduce((s, d) => s + d.monto_original, 0));

  readonly totalPaid = computed(() =>
    this._budget().debts.reduce((s, d) =>
      s + (d.monto_original - d.saldo_pendiente), 0));

  readonly totalCurrent = computed(() =>
    this._budget().debts.reduce((s, d) => s + d.saldo_pendiente, 0));

  readonly freedomPercent = computed(() => {
    const orig = this.totalOriginal();
    return orig > 0 ? Math.round((this.totalPaid() / orig) * 100) : 0;
  });

  // ── Distribución por acreedor (para gráfico) ──────────────────────
  readonly distribution = computed(() =>
    this._budget().debts.map(d => {
      const cred = CREDITORS_SEED.find(c => c.id === d.creditorId);
      const balance = d.saldo_pendiente;
      const total   = this.totalCurrent();
      return {
        name:    cred?.nombre ?? d.creditorId,
        color:   cred?.color  ?? '#6b7280',
        balance,
        percent: total > 0 ? Math.round((balance / total) * 100) : 0,
      };
    }),
  );

  // ── Racha de pagos ────────────────────────────────────────────────
  readonly streak = computed<StreakInfo>(() => {
    const months = [
      { label: 'ENE', onTime: true  },
      { label: 'FEB', onTime: true  },
      { label: 'MAR', onTime: true  },
      { label: 'ABR', onTime: true  },
      { label: 'MAY', onTime: true  },
      { label: 'JUN', onTime: false },
      { label: 'JUL', onTime: false },
    ];
    let current = 0;
    for (const m of months) { if (m.onTime) current++; else break; }
    let longest = 0, run = 0;
    for (const m of months) { run = m.onTime ? run + 1 : 0; if (run > longest) longest = run; }
    return { currentStreak: current, longestStreak: longest, months };
  });

  // ── Logros ────────────────────────────────────────────────────────
  readonly achievements = computed<Achievement[]>(() => {
    const streak   = this.streak();
    const hasData  = this._budget().debts.length > 0 && this._budget().salary > 0;
    const paidOff  = this._budget().debts.some(d => d.saldo_pendiente === 0);

    return [
      { label: '1er registro', icon: 'medal-outline',   earned: hasData },
      { label: '3 meses',      icon: 'flame-outline',   earned: streak.currentStreak >= 3 },
      { label: 'Deuda saldada',icon: 'trophy-outline',  earned: paidOff },
      { label: 'Año sin mora', icon: 'star-outline',    earned: streak.longestStreak >= 12 },
    ];
  });

  // ── Próximo vencimiento ───────────────────────────────────────────
  readonly nextDue = computed(() => {
    const debts = this._budget().debts.filter(d => d.estado !== 'pagada');
    if (debts.length === 0) return null;
    return [...debts].sort((a, b) =>
      new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime())[0];
  });

  // ── ¿Hay datos ingresados? ────────────────────────────────────────
  readonly hasData = computed(() =>
    this._budget().salary > 0 || this._budget().debts.length > 0);

  // ── Mutaciones ────────────────────────────────────────────────────
  setSalary(v: number): void {
    this._budget.update(b => ({ ...b, salary: v }));
  }

  setExtras(v: number): void {
    this._budget.update(b => ({ ...b, extras: v }));
  }

  setCreditorPayment(id: string, v: number): void {
    this._budget.update(b => ({
      ...b,
      creditorPayments: { ...b.creditorPayments, [id]: v },
    }));
  }

  upsertDebt(debt: DebtEntry): void {
    this._budget.update(b => {
      const idx = b.debts.findIndex(d => d.creditorId === debt.creditorId);
      const debts = idx >= 0
        ? b.debts.map((d, i) => i === idx ? debt : d)
        : [...b.debts, debt];
      return { ...b, debts };
    });
  }

  removeDebt(creditorId: string): void {
    this._budget.update(b => ({
      ...b,
      debts: b.debts.filter(d => d.creditorId !== creditorId),
    }));
    this.setCreditorPayment(creditorId, 0);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  debtPct(debt: DebtEntry): number {
    if (debt.monto_original === 0) return 0;
    return Math.round(
      ((debt.monto_original - debt.saldo_pendiente) / debt.monto_original) * 100,
    );
  }

  creditorById(id: string) {
    return CREDITORS_SEED.find(c => c.id === id);
  }

  creditorName(id: string): string {
    return this.creditorById(id)?.nombre ?? id;  // ← "nombre" no "name"
  }

  creditorColor(id: string): string {
    return this.creditorById(id)?.color ?? '#6b7280';
  }

  creditorIcon(id: string): string {
    return this.creditorById(id)?.iconName ?? 'business-outline';
  }

  formatClp(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }
}
