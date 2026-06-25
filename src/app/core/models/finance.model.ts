// ── Acreedores ────────────────────────────────────────────────────
export type CreditorType = 'retail' | 'bank' | 'caja';

export interface Creditor {
  id: string;
  name: string;
  type: CreditorType;
  color: string;
  iconName: string; // ionicons
}

// ── Deudas ────────────────────────────────────────────────────────
export interface Debt {
  id: string;
  creditor: Creditor;
  originalAmount: number;
  currentBalance: number;
  cae: number;           // decimal: 0.44 = 44%
  monthlyPayment: number;
  installmentsLeft: number;
  dueDay: number;
}

// ── Racha de pagos ────────────────────────────────────────────────
export interface MonthStreak {
  label: string;         // 'ENE', 'FEB', …
  onTime: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  months: MonthStreak[];
}

// ── Logros ────────────────────────────────────────────────────────
export type AchievementType =
  | 'first_payment'
  | 'three_months_streak'
  | 'debt_paid_off'
  | 'one_year_no_default';

export interface Achievement {
  type: AchievementType;
  label: string;
  icon: string;
  earned: boolean;
}
