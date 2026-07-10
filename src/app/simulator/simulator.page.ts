import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  calculatorOutline, trendingDownOutline, snowOutline,
  informationOutline, warningOutline,
  calendarOutline, chevronForwardOutline,
  cloudOutline, closeCircleOutline,
  saveOutline, checkmarkCircleOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonSpinner,
  IonSegment, IonSegmentButton, IonLabel, IonRange,
} from '@ionic/angular/standalone';

import { AppStore } from '../core/services/app.store';
import { DebtStrategyService } from '../core/services/debt-strategy.service';
import { SimulatorApiService } from '../core/services/simulator-api.service';
import { CMF_PHASES, getActiveCmfPhase } from '../core/services/cmf-phases.const';
import {
  SimDebt, SimulationResult, StrategyResult, StrategyType,
  ProjectResponse,
} from '../core/models/simulator.model';
import { ProjectionChartComponent } from './projection-chart.component';
import { ClpPipe } from '../shared/pipes/clp.pipe';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, ClpPipe,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonBackButton, IonButtons, IonIcon,
    IonSegment, IonSegmentButton, IonLabel, IonRange,
    ProjectionChartComponent,
  ],
  templateUrl: './simulator.page.html',
  styleUrls: ['./simulator.page.scss'],
})
export class SimulatorPage implements OnInit {

  readonly MONTHLY_MIN  = 1_000;
  readonly MONTHLY_MAX  = 500_000;
  readonly MONTHLY_STEP = 1_000;

  monthlyPayment  = signal(50_000);
  activeStrategy  = signal<StrategyType>('snowball');
  activeDebtIndex = signal(0);

  savingSimulation = signal(false);
  simulationSaved = signal(false);
  apiError = signal<string | null>(null);
  usingLocal = signal(true);
  apiResult = signal<ProjectResponse | null>(null);

  simDebts = computed<SimDebt[]>(() =>
    this.store.deudas().map(d => ({
      debtId: d.id,
      creditorId: d.acreedor.id,
      creditorName: d.acreedor.nombreComercial,
      creditorColor: this.store.creditorColor(d.acreedor.id),
      monto_original: Number(d.monto_original) || 0,
      saldo_pendiente: Number(d.saldo_pendiente) || 0,
      tasa_interes: Number(d.tasa_interes) || 0,
      porcentaje_pago_minimo: Number(d.porcentaje_pago_minimo) || 0,
      fecha_limite: d.fecha_limite,
      estado: d.estado,
      monthlyPayment: Number((d as any).cuotaMensual) || Number((d as any).cuota_mensual) || (Number(d.porcentaje_pago_minimo)
        ? Math.ceil(Number(d.saldo_pendiente) * Number(d.porcentaje_pago_minimo) / 100)
        : 50000),
      totalCuotas: Number(d.total_cuotas) || 12,
      cuotasPagadas: Number(d.cuotas_pagadas) || 0,
      cuotaMensual: Number((d as any).cuotaMensual) || Number((d as any).cuota_mensual) || 0,
    })),
  );

  activeDebt = computed(() => this.simDebts()[this.activeDebtIndex()] ?? null);

  isValidSimulation = computed(() => this.monthlyPayment() > 0);

  estrategiaRecomendada = computed((): StrategyType => {
    const debts = this.simDebts();
    if (debts.length === 0) return 'snowball';
    const tasasAltas = debts.filter(d => Number(d.tasa_interes) > 30);
    if (tasasAltas.length > 0) return 'avalanche';
    const deudasPequenas = debts.filter(d => Number(d.saldo_pendiente) < 100000);
    if (deudasPequenas.length >= 2) return 'snowball';
    return 'avalanche';
  });

  mensajeRecomendacion = computed(() => {
    const estrategia = this.estrategiaRecomendada();
    if (this.simDebts().length === 1) {
      return 'Con una sola deuda, ambas estrategias dan el mismo resultado. Prueba agregar mas deudas para ver la diferencia.';
    }
    if (estrategia === 'avalanche') {
      return 'Tienes deudas con tasas altas. La estrategia Avalancha te ayudara a ahorrar mas en intereses.';
    }
    return 'Tienes varias deudas pequenas. La estrategia Bola de Nieve te dara victorias rapidas y te mantendra motivado.';
  });

  debtInteresMensual = computed(() => {
    const debt = this.activeDebt();
    if (!debt) return 0;
    const tasaInteres = Number(debt.tasa_interes) || 0;
    const tasa = tasaInteres > 10 ? (tasaInteres / 12) / 100 : tasaInteres / 100;
    return Math.round((Number(debt.saldo_pendiente) || 0) * tasa);
  });

  simulationResult = computed<SimulationResult | null>(() => {
    const debt = this.activeDebt();
    if (!debt || !this.isValidSimulation()) return null;
    return this.strategySvc.simulate(debt, this.monthlyPayment(), 0);
  });

  displayResult = computed(() => {
    const apiRes = this.apiResult();
    if (apiRes) {
      return {
        monthsWithout: apiRes.monthsWithout,
        monthsWith: apiRes.monthsWith,
        monthsSaved: apiRes.monthsSaved,
        totalPaidWithout: apiRes.totalPaidWithout,
        totalPaidWith: apiRes.totalPaidWith,
        interestSavedCLP: apiRes.interestSavedCLP,
        projection: apiRes.projection,
        paidPercent: apiRes.paidPercent,
        esTrampa: apiRes.esTrampa,
        pagoMinimoCMF: apiRes.pagoMinimoCMF,
      } as any;
    }
    const local = this.simulationResult();
    if (local) {
      return { ...local, paidPercent: 0, esTrampa: false, pagoMinimoCMF: 0 };
    }
    return null;
  });

  comparacionPagoMinimo = computed(() => {
    const debt = this.activeDebt();
    if (!debt) return null;

    const pagoMinimo = this.pagoMinimoCmf();
    const pagoPropuesto = this.monthlyPayment();

    if (pagoPropuesto <= pagoMinimo) return null;

    const simulacionMinimo = this.strategySvc.simulate(debt, pagoMinimo, 0);
    const simulacionPropuesto = this.strategySvc.simulate(debt, pagoPropuesto, 0);

    return {
      mesesMinimo: simulacionMinimo.monthsWithout,
      mesesPropuesto: simulacionPropuesto.monthsWithout,
      mesesAhorrados: simulacionMinimo.monthsWithout - simulacionPropuesto.monthsWithout,
      interesesAhorrados: simulacionMinimo.totalPaidWithout - simulacionPropuesto.totalPaidWithout,
      totalMinimo: simulacionMinimo.totalPaidWithout,
      totalPropuesto: simulacionPropuesto.totalPaidWithout,
    };
  });

  strategyResult = computed<StrategyResult>(() => {
    const debts = this.simDebts();
    return this.activeStrategy() === 'snowball'
      ? this.strategySvc.snowball(debts)
      : this.strategySvc.avalanche(debts);
  });

  simulacionEstrategia = computed(() => {
    const debts = this.simDebts();
    if (debts.length === 0) return null;

    const ordenadas = this.activeStrategy() === 'snowball'
      ? this.strategySvc.snowball(debts)
      : this.strategySvc.avalanche(debts);

    let mesesTotales = 0;
    let interesesTotales = 0;
    let pagoTotal = 0;

    for (const deuda of ordenadas.orderedDebts) {
      const result = this.strategySvc.simulate(deuda, deuda.monthlyPayment, 0);
      mesesTotales = Math.max(mesesTotales, result.monthsWithout);
      interesesTotales += result.totalPaidWithout - Number(deuda.saldo_pendiente);
      pagoTotal += result.totalPaidWithout;
    }

    return {
      mesesTotales,
      interesesTotales,
      pagoTotal,
      deudasOrdenadas: ordenadas.orderedDebts,
    };
  });

  cmfPhase  = getActiveCmfPhase();
  cmfPhases = CMF_PHASES;

  pagoMinimoCmf = computed(() => {
    const debt = this.activeDebt();
    if (!debt) return 0;
    return debt.monthlyPayment;
  });

  constructor(
    public store: AppStore,
    private strategySvc: DebtStrategyService,
    private simulatorApi: SimulatorApiService,
  ) {
    addIcons({
      calculatorOutline, trendingDownOutline, snowOutline,
      informationOutline, warningOutline,
      calendarOutline, chevronForwardOutline,
      cloudOutline, closeCircleOutline,
      saveOutline, checkmarkCircleOutline,
    });
  }

  ngOnInit(): void {
    const first = this.activeDebt();
    if (first) this.monthlyPayment.set(first.monthlyPayment || 50_000);
    this.activeStrategy.set(this.estrategiaRecomendada());
  }

  onMonthlyChange(event: Event): void {
    const value = Number((event as CustomEvent).detail.value);
    this.monthlyPayment.set(value);
    this.apiError.set(null);
    this.apiResult.set(null);
    this.usingLocal.set(true);
    this.simulationSaved.set(false);
  }

  onStrategyChange(event: Event): void {
    this.activeStrategy.set((event as CustomEvent).detail.value as StrategyType);
  }

  selectDebt(index: number): void {
    this.activeDebtIndex.set(index);
    const debt = this.simDebts()[index];
    if (debt) this.monthlyPayment.set(debt.monthlyPayment || 50_000);
    this.apiResult.set(null);
    this.usingLocal.set(true);
    this.simulationSaved.set(false);
  }

  saveSimulation(): void {
    const debt = this.activeDebt();
    const result = this.displayResult();
    if (!debt || !result) return;

    this.savingSimulation.set(true);
    this.simulatorApi.guardarSimulacion({
      deudaId: debt.debtId,
      montoPropuesto: this.monthlyPayment(),
      resultado: result,
    }).subscribe({
      next: () => {
        this.savingSimulation.set(false);
        this.simulationSaved.set(true);
        setTimeout(() => this.simulationSaved.set(false), 3000);
      },
      error: (err) => {
        this.savingSimulation.set(false);
        this.apiError.set(err.message);
      },
    });
  }

  clearSimulation(): void {
    this.apiResult.set(null);
    this.usingLocal.set(true);
    this.apiError.set(null);
    this.simulationSaved.set(false);
  }

  formatClp = (n: number) => {
    if (isNaN(n) || n === undefined || n === null) return '$0';
    return this.strategySvc.formatClp(n);
  };

  strategyDesc(type: StrategyType): string {
    return type === 'snowball'
      ? 'Paga primero la deuda de menor saldo. Victorias rapidas que reducen el estres.'
      : 'Paga primero la tasa mas alta. Maximo ahorro de dinero a largo plazo.';
  }
}