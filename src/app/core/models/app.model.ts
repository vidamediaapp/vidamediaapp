// ── Tipos base ────────────────────────────────────────────────────
export type EstadoDeuda = 'pendiente' | 'pagada' | 'vencida';

// ── Acreedor ─────────────────────────────────────────────────────
export interface Acreedor {
  id: string;
  nombre: string;           // ← "nombre", no "name"
  tipo: 'retail' | 'banco' | 'caja';
  color: string;
  iconName: string;
}

// ── Modelo Deuda del backend (Diego) ─────────────────────────────
export interface Deuda {
  id: string;
  monto_original: number;
  saldo_pendiente: number;
  tasa_interes: number;
  porcentaje_pago_minimo: number;
  fecha_limite: string;
  estado: EstadoDeuda;
  acreedor: Acreedor;
  creadoEn?: string;
  actualizadoEn?: string;
}

// ── DTO para POST /api/deudas ─────────────────────────────────────
export interface CreateDeudaDto {
  monto_original: number;
  saldo_pendiente: number;
  tasa_interes: number;
  porcentaje_pago_minimo: number;
  fecha_limite: string;
  estado: EstadoDeuda;
  acreedorId: string;
}

// ── DebtEntry local (lo que guarda el store del frontend) ─────────
// Usa los mismos campos que Deuda del backend
export interface DebtEntry {
  creditorId: string;
  // Campos exactos del modelo Deuda de Diego
  monto_original: number;
  saldo_pendiente: number;
  tasa_interes: number;
  porcentaje_pago_minimo: number;
  fecha_limite: string;
  estado: EstadoDeuda;
  // Campos extra del frontend
  monthlyPayment: number;
  cuotasTotales: number;
  cuotasPagadas: number;
}

// ── Presupuesto mensual ───────────────────────────────────────────
export interface BudgetMonth {
  salary: number;
  extras: number;
  creditorPayments: Record<string, number>;
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
