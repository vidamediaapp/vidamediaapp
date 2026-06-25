import { Injectable, signal, computed } from '@angular/core';
import { Debt, StreakInfo, Achievement, Creditor } from '../models/finance.model';

// ── Acreedores chilenos precargados (equivalente al TypeORM Seeder) ─
const CREDITORS: Record<string, Creditor> = {
  falabella:  { id: 'falabella',  name: 'Falabella CMR',  type: 'retail', color: '#A32D2D', iconName: 'storefront-outline' },
  ripley:     { id: 'ripley',     name: 'Ripley',         type: 'retail', color: '#BA7517', iconName: 'cart-outline'       },
  cajaAndes:  { id: 'cajaAndes',  name: 'Caja Los Andes', type: 'caja',   color: '#378ADD', iconName: 'business-outline'   },
  bancoEstado:{ id: 'bancoEstado',name: 'BancoEstado',    type: 'bank',   color: '#1D9E75', iconName: 'card-outline'       },
};

@Injectable({ providedIn: 'root' })
export class FinanceStore {

  // ── Estado privado ────────────────────────────────────────────────
  private readonly _debts = signal<Debt[]>([
    {
      id: 'debt_falabella',
      creditor: CREDITORS['falabella'],
      originalAmount:  600_000,
      currentBalance:  450_000,
      cae:             0.44,
      monthlyPayment:   50_000,
      installmentsLeft: 3,
      dueDay: 18,
    },
    {
      id: 'debt_caja',
      creditor: CREDITORS['cajaAndes'],
      originalAmount:  3_800_000,
      currentBalance:  3_200_000,
      cae:             0.18,
      monthlyPayment:  180_000,
      installmentsLeft: 18,
      dueDay: 25,
    },
    {
      id: 'debt_ripley',
      creditor: CREDITORS['ripley'],
      originalAmount:  1_200_000,
      currentBalance:   890_000,
      cae:             0.38,
      monthlyPayment:   95_000,
      installmentsLeft: 6,
      dueDay: 30,
    },
  ]);

  private readonly _paymentsCount = signal<number>(3);

  // ── API pública (solo lectura) ────────────────────────────────────
  readonly debts = this._debts.asReadonly();

  readonly totalOriginal = computed(() =>
    this._debts().reduce((s, d) => s + d.originalAmount, 0));

  readonly totalCurrent = computed(() =>
    this._debts().reduce((s, d) => s + d.currentBalance, 0));

  readonly totalPaid = computed(() =>
    this.totalOriginal() - this.totalCurrent());

  readonly freedomPercent = computed(() => {
    const orig = this.totalOriginal();
    return orig === 0 ? 0 : Math.round((this.totalPaid() / orig) * 100);
  });

  // Distribución para el gráfico de torta
  readonly distribution = computed(() =>
    this._debts().map(d => ({
      name:    d.creditor.name,
      value:   d.currentBalance,
      color:   d.creditor.color,
      percent: this.totalCurrent() > 0
        ? Math.round((d.currentBalance / this.totalCurrent()) * 100)
        : 0,
    })),
  );

  // ── Racha de pagos ─────────────────────────────────────────────────
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

    // Racha actual: contar desde el primero hasta el primer false
    let current = 0;
    for (const m of months) {
      if (m.onTime) current++; else break;
    }

    // Racha más larga
    let longest = 0, run = 0;
    for (const m of months) {
      run = m.onTime ? run + 1 : 0;
      if (run > longest) longest = run;
    }

    return { currentStreak: current, longestStreak: longest, months };
  });

  // ── Logros ──────────────────────────────────────────────────────────
  readonly achievements = computed<Achievement[]>(() => {
    const streak = this.streak();
    const hasPaid = this._paymentsCount() > 0;
    const paidOff = this._debts().some(d => d.currentBalance === 0);

    return [
      { type: 'first_payment',       label: '1er pago',     icon: 'medal-outline',   earned: hasPaid },
      { type: 'three_months_streak', label: '3 meses',      icon: 'flame-outline',   earned: streak.currentStreak >= 3 },
      { type: 'debt_paid_off',       label: 'Deuda saldada',icon: 'trophy-outline',  earned: paidOff },
      { type: 'one_year_no_default', label: 'Año sin mora', icon: 'star-outline',    earned: streak.longestStreak >= 12 },
    ];
  });

  // ── Próximo vencimiento ─────────────────────────────────────────────
  readonly nextDue = computed(() => {
    const today = new Date().getDate();
    const sorted = [...this._debts()].sort((a, b) => {
      const da = a.dueDay >= today ? a.dueDay : a.dueDay + 31;
      const db = b.dueDay >= today ? b.dueDay : b.dueDay + 31;
      return da - db;
    });
    return sorted[0] ?? null;
  });

  // ── Mutaciones ──────────────────────────────────────────────────────
  applyPayment(debtId: string, amount: number): void {
    this._debts.update(list =>
      list.map(d => d.id === debtId
        ? { ...d, currentBalance: Math.max(0, d.currentBalance - amount), installmentsLeft: Math.max(0, d.installmentsLeft - 1) }
        : d,
      ),
    );
    this._paymentsCount.update(n => n + 1);
  }

  progressOf(debt: Debt): number {
    if (debt.originalAmount === 0) return 0;
    return Math.round(((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100);
  }
}
