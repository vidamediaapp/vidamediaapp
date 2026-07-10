import { Injectable } from '@angular/core';
import { SimDebt, SimulationResult, StrategyResult, MonthlyProjection } from '../models/simulator.model';

@Injectable({ providedIn: 'root' })
export class DebtStrategyService {

simulate(debt: SimDebt, monthlyPayment: number, extraPayment: number): SimulationResult {
    const tasaInteres = Number(debt.tasa_interes) || 0;
    const saldoPendiente = Number(debt.saldo_pendiente) || 0;
    const tasaMensual = tasaInteres > 10 ? (tasaInteres / 12) / 100 : tasaInteres / 100;
    const pagoSinExtra = Number(monthlyPayment) || 0;
    const pagoConExtra = Number(monthlyPayment) + Number(extraPayment);

    let saldoSin = saldoPendiente;
    let saldoCon = saldoPendiente;
    let totalPagadoSin = 0;
    let totalPagadoCon = 0;
    let mesesSin = 0;
    let mesesCon = 0;
    const maxMeses = 360;

    const projection: MonthlyProjection[] = [];
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();

    while ((saldoSin > 0 || saldoCon > 0) && (mesesSin < maxMeses || mesesCon < maxMeses)) {
      const mesActual = Math.max(mesesSin, mesesCon);
      const mesFecha = new Date(hoy.getFullYear(), hoy.getMonth() + mesActual, 1);
      const label = `${mesesNombres[mesFecha.getMonth()]} ${mesFecha.getFullYear().toString().slice(-2)}`;

      if (saldoSin > 0) {
        mesesSin++;
        const interesSin = saldoSin * tasaMensual;
        const pagoEfectivoSin = Math.min(pagoSinExtra, saldoSin + interesSin);
        saldoSin = saldoSin + interesSin - pagoEfectivoSin;
        totalPagadoSin += pagoEfectivoSin;
        if (saldoSin < 0.01) saldoSin = 0;
      }

      if (saldoCon > 0) {
        mesesCon++;
        const interesCon = saldoCon * tasaMensual;
        const pagoEfectivoCon = Math.min(pagoConExtra, saldoCon + interesCon);
        saldoCon = saldoCon + interesCon - pagoEfectivoCon;
        totalPagadoCon += pagoEfectivoCon;
        if (saldoCon < 0.01) saldoCon = 0;
      }

      projection.push({
        month: mesActual + 1,
        label,
        balanceWithout: Math.round(saldoSin * 100) / 100,
        balanceWith: Math.round(saldoCon * 100) / 100
      });

      if (mesesSin >= maxMeses && saldoSin > 0) mesesSin = 999;
      if (mesesCon >= maxMeses && saldoCon > 0) mesesCon = 999;
    }

    return {
      monthsWithout: mesesSin,
      monthsWith: mesesCon,
      monthsSaved: Math.max(0, mesesSin - mesesCon),
      interestSavedCLP: Math.round((totalPagadoSin - totalPagadoCon) * 100) / 100,
      totalPaidWithout: Math.round(totalPagadoSin * 100) / 100,
      totalPaidWith: Math.round(totalPagadoCon * 100) / 100,
      projection
    };
}

  snowball(debts: SimDebt[]): StrategyResult {
    const sorted = [...debts].sort((a, b) => a.saldo_pendiente - b.saldo_pendiente);
    return {
      type: 'snowball',
      orderedDebts: sorted,
      totalInterestSaved: 0,
      estimatedMonths: 0
    };
  }

  avalanche(debts: SimDebt[]): StrategyResult {
    const sorted = [...debts].sort((a, b) => b.tasa_interes - a.tasa_interes);
    return {
      type: 'avalanche',
      orderedDebts: sorted,
      totalInterestSaved: 0,
      estimatedMonths: 0
    };
  }

  calcPagoMinimo(debt: SimDebt): number {
    const totalCuotas = Number(debt.totalCuotas) || 12;
    const cuotasPagadas = Number(debt.cuotasPagadas) || 0;
    const cuotasRestantes = Math.max(1, totalCuotas - cuotasPagadas);
    const cuotaBase = debt.saldo_pendiente / cuotasRestantes;
    const interesMensual = debt.saldo_pendiente * (debt.tasa_interes / 100);
    const pagoMinimo = cuotaBase + interesMensual;
    return Math.ceil(pagoMinimo);
  }

  formatClp(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }
}