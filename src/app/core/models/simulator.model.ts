export type StrategyType = 'snowball' | 'avalanche';
export type EstadoDeuda  = 'pendiente' | 'pagada' | 'vencida';

export interface SimDebt {
  debtId: string;
  creditorId: string;
  creditorName: string;
  creditorColor: string;
  monto_original: number;
  saldo_pendiente: number;
  tasa_interes: number;
  porcentaje_pago_minimo: number;
  fecha_limite: string;
  estado: string;
  monthlyPayment: number;
  totalCuotas: number;
  cuotasPagadas: number;
  cuotaMensual: number;
}

export interface MonthlyProjection {
  month: number;
  label: string;
  balanceWithout: number;
  balanceWith: number;
}

export interface SimulationResult {
  monthsWithout:    number;
  monthsWith:       number;
  monthsSaved:      number;
  interestSavedCLP: number;
  totalPaidWithout: number;
  totalPaidWith:    number;
  projection:       MonthlyProjection[];
}

export interface StrategyResult {
  type:               StrategyType;
  orderedDebts:       SimDebt[];
  totalInterestSaved: number;
  estimatedMonths:    number;
}

export interface ProjectDto {
  debtId: string;
  saldo_pendiente: number;
  tasa_interes: number;
  monthlyPayment: number;
  extraPayment: number;
}

export interface ProjectResponse {
  deudaId: string;
  monthsWithout: number;
  monthsWith: number;
  monthsSaved: number;
  totalPaidWithout: number;
  totalPaidWith: number;
  interestSavedCLP: number;
  esTrampa: boolean;
  pagoMinimoCMF: number;
  faseCMF: number;
  paidPercent: number;
  projection: MonthlyProjection[];
}