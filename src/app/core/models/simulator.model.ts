export type StrategyType = 'snowball' | 'avalanche';
export type EstadoDeuda  = 'pendiente' | 'pagada' | 'vencida';

// ── Deuda que llega del store / backend ───────────────────────────
export interface SimDebt {
  creditorId:             string;
  creditorName:           string;
  creditorColor:          string;
  monto_original:         number;
  saldo_pendiente:        number;
  tasa_interes:           number;   // % mensual, ej: 2.5
  porcentaje_pago_minimo: number;   // % del saldo, ej: 3
  fecha_limite:           string;
  estado:                 EstadoDeuda;
  monthlyPayment:         number;
}

// ── Punto de proyección mes a mes ─────────────────────────────────
export interface MonthlyProjection {
  month:          number;
  label:          string;
  balanceWithout: number;  // sin pago extra
  balanceWith:    number;  // con pago extra
}

// ── Resultado de simulación ───────────────────────────────────────
export interface SimulationResult {
  monthsWithout:    number;
  monthsWith:       number;
  monthsSaved:      number;
  interestSavedCLP: number;
  totalPaidWithout: number;
  totalPaidWith:    number;
  projection:       MonthlyProjection[];
}

// ── Resultado de estrategia ───────────────────────────────────────
export interface StrategyResult {
  type:               StrategyType;
  orderedDebts:       SimDebt[];
  totalInterestSaved: number;
  estimatedMonths:    number;
}

// ── DTO para POST /simulator/project ─────────────────────────────
export interface ProjectDto {
  debtId:             string;
  saldo_pendiente:    number;
  tasa_interes:       number;
  monthlyPayment:     number;
  extraPayment:       number;
}

// ── Respuesta del backend ─────────────────────────────────────────
export interface ProjectResponse {
  monthsWithout:    number;
  monthsWith:       number;
  monthsSaved:      number;
  interestSavedCLP: number;
  projection:       MonthlyProjection[];
}
