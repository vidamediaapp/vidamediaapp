import { Injectable } from '@angular/core';
import {
  SimDebt, SimulationResult, StrategyResult,
  StrategyType, MonthlyProjection,
} from '../models/simulator.model';

@Injectable({ providedIn: 'root' })
export class DebtStrategyService {

  // ── Bola de nieve: menor saldo primero ───────────────────────────
  snowball(debts: SimDebt[]): StrategyResult {
    const ordered = [...debts].sort((a, b) => a.saldo_pendiente - b.saldo_pendiente);
    return this.buildResult('snowball', ordered);
  }

  // ── Avalancha: mayor tasa de interés primero ─────────────────────
  avalanche(debts: SimDebt[]): StrategyResult {
    const ordered = [...debts].sort((a, b) => b.tasa_interes - a.tasa_interes);
    return this.buildResult('avalanche', ordered);
  }

  // ── Simulador "¿qué pasa si?" ─────────────────────────────────────
  simulate(
    debt: SimDebt,
    monthlyPayment: number,
    extraPayment: number,
  ): SimulationResult {
    // Convertir tasa mensual porcentual a decimal
    // tasa_interes viene como porcentaje mensual del backend (ej: 2.5 = 2.5%)
    const rate = debt.tasa_interes / 100;

    const monthsWithout = this.calcMonths(debt.saldo_pendiente, rate, monthlyPayment);
    const balanceAfterExtra = Math.max(0, debt.saldo_pendiente - extraPayment);
    const monthsWith = this.calcMonths(balanceAfterExtra, rate, monthlyPayment);

    const totalPaidWithout = monthsWithout < 999
      ? monthsWithout * monthlyPayment
      : debt.saldo_pendiente * 3; // estimado si nunca termina

    const totalPaidWith = extraPayment + (monthsWith < 999
      ? monthsWith * monthlyPayment
      : debt.saldo_pendiente * 3);

    const interestSavedCLP = Math.max(0, totalPaidWithout - totalPaidWith);

    return {
      monthsWithout,
      monthsWith,
      monthsSaved:      Math.max(0, monthsWithout - monthsWith),
      interestSavedCLP,
      totalPaidWithout,
      totalPaidWith,
      projection: this.buildProjection(
        debt.saldo_pendiente, balanceAfterExtra, rate, monthlyPayment,
      ),
    };
  }

  // ── Cálculo de meses para liquidar ────────────────────────────────
  calcMonths(balance: number, monthlyRate: number, payment: number): number {
    if (balance <= 0) return 0;
    // Si el pago no cubre los intereses del mes, nunca termina
    if (payment <= balance * monthlyRate) return 999;
    return Math.ceil(
      -Math.log(1 - (balance * monthlyRate) / payment) /
      Math.log(1 + monthlyRate),
    );
  }

  // ── Proyección mes a mes ──────────────────────────────────────────
  buildProjection(
    balanceSin: number,
    balanceCon: number,
    rate: number,
    payment: number,
    months = 12,
  ): MonthlyProjection[] {
    const now  = new Date();
    const proj: MonthlyProjection[] = [{
      month: 0, label: 'Hoy',
      balanceWithout: Math.round(balanceSin),
      balanceWith:    Math.round(balanceCon),
    }];

    let sin = balanceSin;
    let con = balanceCon;

    for (let m = 1; m <= months; m++) {
      sin = Math.max(0, sin * (1 + rate) - payment);
      con = Math.max(0, con * (1 + rate) - payment);
      const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
      proj.push({
        month: m,
        label: d.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' }),
        balanceWithout: Math.round(sin),
        balanceWith:    Math.round(con),
      });
      if (sin === 0 && con === 0) break;
    }
    return proj;
  }

  // ── Pago mínimo según norma CMF ───────────────────────────────────
  calcPagoMinimo(saldo: number, pct: number): number {
    return Math.ceil(saldo * pct / 100);
  }

  formatClp(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }

  // ── Privados ──────────────────────────────────────────────────────
  private buildResult(type: StrategyType, ordered: SimDebt[]): StrategyResult {
    const estimatedMonths = Math.max(...ordered.map(d => {
      const rate = d.tasa_interes / 100;
      return this.calcMonths(d.saldo_pendiente, rate, d.monthlyPayment);
    }));

    const totalInterestSaved = ordered.reduce((acc, d) => {
      const rate   = d.tasa_interes / 100;
      const mMin   = this.calcMonths(d.saldo_pendiente, rate, this.calcPagoMinimo(d.saldo_pendiente, d.porcentaje_pago_minimo));
      const mOpt   = this.calcMonths(d.saldo_pendiente, rate, d.monthlyPayment);
      const saving = Math.max(0, mMin * this.calcPagoMinimo(d.saldo_pendiente, d.porcentaje_pago_minimo) - mOpt * d.monthlyPayment);
      return acc + saving;
    }, 0);

    return { type, orderedDebts: ordered, totalInterestSaved, estimatedMonths };
  }
}
