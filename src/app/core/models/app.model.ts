// ── Acreedores ────────────────────────────────────────────────────
export type CreditorId = 'falabella' | 'ripley' | 'cajaAndes' | 'bancoEstado';

export interface Creditor {
  id: CreditorId;
  name: string;
  cae: number;
  color: string;
  iconName: string;
}

// ── Deuda registrada en presupuesto ───────────────────────────────
export interface DebtEntry {
  creditorId: CreditorId;
  totalAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  monthlyPayment: number;
}

// ── Presupuesto mensual ───────────────────────────────────────────
export interface BudgetMonth {
  salary: number;
  extras: number;
  creditorPayments: Record<CreditorId, number>;
  debts: DebtEntry[];
}

// ── Racha ─────────────────────────────────────────────────────────
export interface MonthStreak {
  label: string;
  onTime: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  months: MonthStreak[];
}

// ── Logros ────────────────────────────────────────────────────────
export interface Achievement {
  label: string;
  icon: string;
  earned: boolean;
}
