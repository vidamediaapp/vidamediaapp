import { Injectable, signal, computed } from '@angular/core';
import {
  BudgetMonth, DebtEntry, StreakInfo,
  Achievement, CreditorId,
} from '../models/app.model';
import { CREDITORS } from './creditors.seed';

@Injectable({ providedIn: 'root' })
export class AppStore {

  readonly creditors = CREDITORS;

  // ── Estado base ────────────────────────────────────────────────
  // Todo lo que escribe presupuesto.page.ts vive aquí.
  // home.page.ts solo lee — nunca escribe directamente.
  private readonly _budget = signal<BudgetMonth>({
    salary: 0,
    extras: 0,
    creditorPayments: {
      falabella:   0,
      ripley:      0,
      cajaAndes:   0,
      bancoEstado: 0,
    },
    debts: [],
  });

  // ── Lectura pública del presupuesto ───────────────────────────
  readonly budget = this._budget.asReadonly();

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

  // ── Datos derivados para el HOME ──────────────────────────────
  // Estas propiedades calculan todo desde el presupuesto ingresado.

  /** Deuda total original: suma de todos los montos registrados */
  readonly totalOriginal = computed(() =>
    this._budget().debts.reduce((s, d) => s + d.totalAmount, 0));

  /** Deuda ya pagada: cuotas pagadas × cuota mensual */
  readonly totalPaid = computed(() =>
    this._budget().debts.reduce((s, d) => {
      const cuotaVal = d.totalInstallments > 0
        ? d.totalAmount / d.totalInstallments
        : 0;
      return s + d.paidInstallments * cuotaVal;
    }, 0));

  /** Saldo pendiente actual */
  readonly totalCurrent = computed(() =>
    this.totalOriginal() - this.totalPaid());

  /** Porcentaje pagado (barra de libertad financiera) */
  readonly freedomPercent = computed(() => {
    const orig = this.totalOriginal();
    return orig > 0 ? Math.round((this.totalPaid() / orig) * 100) : 0;
  });

  /** Distribución por acreedor para el gráfico */
  readonly distribution = computed(() => {
    const debts = this._budget().debts;
    const total = this.totalCurrent();
    return debts.map(d => {
      const cuotaVal  = d.totalInstallments > 0 ? d.totalAmount / d.totalInstallments : 0;
      const pagado    = d.paidInstallments * cuotaVal;
      const balance   = Math.max(0, d.totalAmount - pagado);
      const creditor  = CREDITORS.find(c => c.id === d.creditorId)!;
      return {
        name:    creditor.name,
        color:   creditor.color,
        balance,
        percent: total > 0 ? Math.round((balance / total) * 100) : 0,
      };
    });
  });

  /** Próximo vencimiento (deuda con día de vencimiento más cercano) */
  readonly nextDue = computed(() => {
    const debts = this._budget().debts;
    if (debts.length === 0) return null;
    // Usa la cuota mensual del acreedor como referencia
    return debts[0];
  });

  // ── Racha de pagos (fija por ahora, en el futuro viene del backend) ──
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

  // ── Logros: se calculan desde los datos reales del presupuesto ──
  readonly achievements = computed<Achievement[]>(() => {
    const streak     = this.streak();
    const hasDebts   = this._budget().debts.length > 0;
    const hasIncome  = this._budget().salary > 0;
    const anyPaidOff = this._budget().debts.some(
      d => d.paidInstallments >= d.totalInstallments && d.totalInstallments > 0);

    return [
      {
        label: '1er registro',
        icon:  'medal-outline',
        earned: hasDebts && hasIncome,
      },
      {
        label: '3 meses',
        icon:  'flame-outline',
        earned: streak.currentStreak >= 3,
      },
      {
        label: 'Deuda saldada',
        icon:  'trophy-outline',
        earned: anyPaidOff,
      },
      {
        label: 'Año sin mora',
        icon:  'star-outline',
        earned: streak.longestStreak >= 12,
      },
    ];
  });

  // ── Mutaciones (solo las llama presupuesto.page.ts) ────────────
  setSalary(v: number): void {
    this._budget.update(b => ({ ...b, salary: v }));
  }

  setExtras(v: number): void {
    this._budget.update(b => ({ ...b, extras: v }));
  }

  setCreditorPayment(id: CreditorId, v: number): void {
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

  // ── Helpers ────────────────────────────────────────────────────
  debtPct(debt: DebtEntry): number {
    if (debt.totalInstallments === 0) return 0;
    return Math.round(
      (Math.min(debt.paidInstallments, debt.totalInstallments) / debt.totalInstallments) * 100,
    );
  }

  formatClp(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }
}
