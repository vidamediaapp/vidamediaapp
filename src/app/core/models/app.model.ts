// ── Usuario ───────────────────────────────────────────────────────
export interface Usuario {
  id:            string;
  email:         string;
  nombre:        string;
  apaterno:      string;
  amaterno:      string;
  telefono:      string;
  rut:           string;
  monthlyIncome: number;
}

// ── Acreedor ──────────────────────────────────────────────────────
export interface Acreedor {
  id:                   string;
  nombreComercial:      string;
  tipo:                 string;
  tasaInteresTipica:    number;
  porcentajePagoMinimo: number;
  nivelAdvertencia:     string;
  notaEducativa:        string;
  color?:               string;
  iconName?:            string;
}

// ── Deuda ─────────────────────────────────────────────────────────
export type EstadoDeuda = 'pendiente' | 'pagada' | 'vencida';

export interface Deuda {
  id:                     string;
  usuario:                Usuario;
  acreedor:               Acreedor;
  monto_original:         number;
  saldo_pendiente:        number;
  tasa_interes:           number;
  porcentaje_pago_minimo: number;
  fecha_limite:           string;
  estado:                 EstadoDeuda;
  total_cuotas:           number;
  cuotas_pagadas:         number;
  cuotaMensual:           number;
  cuotas_sin_interes:     number;
  mantencion:             number;
  seguros:                number;
  comisiones:             number;
  intereses_acumulados:   number;
}

// ── Presupuesto ───────────────────────────────────────────────────
export interface Presupuesto {
  id:                string;
  usuario:           Usuario;
  mes:               number;
  año:               number;
  salario:           number;
  extras:            number;
  pagosPlanificados: Record<string, number>;
}

// ── Simulación ────────────────────────────────────────────────────
export interface MonthlyProjection {
  month: number;
  label: string;
  balanceWithout: number;
  balanceWith: number;
}

export interface SimulacionResult {
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

// ── Análisis financiero ───────────────────────────────────────────
export interface Recomendacion {
  tipo: 'renegociacion' | 'consolidacion' | 'insolvencia' | 'educacion';
  mensaje: string;
  accion: string;
  enlace?: string;
}

export interface Beneficio {
  nombre: string;
  descripcion: string;
  requisitos: string[];
  enlace: string;
  fuente: string; // 'Superir', 'SERNAC', 'ChileAtiende', etc.
}

export interface AnalisisFinanciero {
  ratioDeudaIngreso:         number;
  nivelRiesgo:               'bajo' | 'medio' | 'alto' | 'critico';
  recomendaciones:           Recomendacion[];
  beneficiosDisponibles:     Beneficio[];
  puedeSolicitarInsolvencia: boolean;
}

// ── DTOs ──────────────────────────────────────────────────────────
export interface CreateDeudaDto {
  acreedorId:             string;
  monto_original:         number;
  saldo_pendiente:        number;
  tasa_interes:           number;
  porcentaje_pago_minimo: number;
  fecha_limite:           string;
  estado:                 EstadoDeuda;
  total_cuotas:           number;
  cuotas_pagadas:         number;
  cuotas_sin_interes:     number;
  mantencion:             number;
  seguros:                number;
  comisiones:             number;
}

export interface CreatePresupuestoDto {
  mes:               number;
  año:               number;
  salario:           number;
  extras:            number;
  pagosPlanificados: Record<string, number>;
}

export interface SimulacionDto {
  deudaId: string;
  montoPropuesto: number;
  extraPayment?: number;
}

// ── Auth ──────────────────────────────────────────────────────────
export interface LoginDto {
  email:    string;
  password: string;
}

export interface RegistroDto {
  rut:       string;
  email:     string;
  nombre:    string;
  apaterno:  string;
  amaterno?: string;
  telefono:  string;
  password:  string;
}

export interface AuthResponse {
  token:   string;
  usuario: Usuario;
}

// ── UI only ───────────────────────────────────────────────────────
export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  months: { label: string; onTime: boolean }[];
}

export interface Achievement {
  label:  string;
  icon:   string;
  earned: boolean;
}
