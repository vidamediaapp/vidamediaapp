import { Injectable, signal, computed } from '@angular/core';
import { BudgetMonth, CreditorId, DebtEntry } from '../models/budget.model';
import { CREDITORS } from './creditors.seed';

@Injectable({ providedIn: 'root' })
export class BudgetStore {

  readonly creditors = CREDITORS;

  private _budget = signal<BudgetMonth>({
    month: new Date().getMonth() + 1,
    year:  new Date().getFullYear(),
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

  readonly budget = this._budget.asReadonly();

  // ── Computed ──────────────────────────────────────────────────────
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

  // ── Mutaciones ────────────────────────────────────────────────────
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
      const existing = b.debts.findIndex(d => d.creditorId === debt.creditorId);
      const debts = existing >= 0
        ? b.debts.map((d, i) => i === existing ? debt : d)
        : [...b.debts, debt];
      return { ...b, debts };
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────
  debtProgressPercent(debt: DebtEntry): number {
    if (debt.totalInstallments === 0) return 0;
    return Math.round((debt.paidInstallments / debt.totalInstallments) * 100);
  }

  formatClp(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }
}
