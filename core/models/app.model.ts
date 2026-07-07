// ══════════════════════════════════════════════════════════════════
// Entidades exactas del backend de Diego
// ══════════════════════════════════════════════════════════════════

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
  cuotas_sin_interes:     number;
  mantencion:             number;
  seguros:                number;
  comisiones:             number;
  intereses_acumulados:   number;
}

export interface Presupuesto {
  id:                string;
  usuario:           Usuario;
  mes:               number;
  año:               number;
  salario:           number;
  extras:            number;
  pagosPlanificados: Record<string, number>;
}

export interface SimulacionResult {
  mesesProyectados:   number;
  totalPagado:        number;
  interesTotal:       number;
  esTrampa:           boolean;
  pagoMinimoSugerido: number;
  pagoMinimoCMF:      number;
  faseCMF:            number;
}

export interface AnalisisFinanciero {
  ratioDeudaIngreso:         number;
  nivelRiesgo:               'bajo' | 'medio' | 'alto' | 'critico';
  recomendaciones:           string[];
  beneficiosDisponibles:     string[];
  puedeSolicitarInsolvencia: boolean;
}

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
  deudaId:         string;
  saldo_pendiente: number;
  tasa_interes:    number;
  monthlyPayment:  number;
  extraPayment:    number;
}

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
  accessToken: string;
  user:        Usuario;
}

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
