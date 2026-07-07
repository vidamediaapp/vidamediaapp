import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  calculatorOutline, trendingDownOutline, snowOutline,
  informationCircleOutline, alertCircleOutline,
  refreshOutline, calendarOutline, chevronForwardOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonSpinner,
  IonSegment, IonSegmentButton, IonLabel, IonRange,
} from '@ionic/angular/standalone';

import { AppStore }            from '../core/services/app.store';
import { DebtStrategyService } from '../core/services/debt-strategy.service';
import { SimulatorApiService } from '../core/services/simulator-api.service';
import { CMF_PHASES, getActiveCmfPhase } from '../core/services/cmf-phases.const';
import {
  SimDebt, SimulationResult, StrategyResult, StrategyType,
} from '../core/models/simulator.model';
import { ProjectionChartComponent } from './projection-chart.component';
import { ClpPipe } from '../shared/pipes/clp.pipe';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, ClpPipe,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonBackButton, IonButtons, IonIcon, IonSpinner,
    IonSegment, IonSegmentButton, IonLabel, IonRange,
    ProjectionChartComponent,
  ],
  templateUrl: './simulator.page.html',
  styleUrls:  ['./simulator.page.scss'],
})
export class SimulatorPage implements OnInit {

  readonly MONTHLY_MIN  =  10_000;
  readonly MONTHLY_MAX  = 500_000;
  readonly MONTHLY_STEP =   5_000;
  readonly EXTRA_MIN    =       0;
  readonly EXTRA_MAX    = 500_000;
  readonly EXTRA_STEP   =  10_000;

  monthlyPayment  = signal(50_000);
  extraPayment    = signal(0);
  activeStrategy  = signal<StrategyType>('snowball');
  activeDebtIndex = signal(0);

  simDebts = computed<SimDebt[]>(() =>
    this.store.budget().debts.map(d => ({
      creditorId:             d.creditorId,
      creditorName:           this.store.creditorName(d.creditorId),
      creditorColor:          this.store.creditorColor(d.creditorId),
      monto_original:         d.monto_original,
      saldo_pendiente:        d.saldo_pendiente,
      tasa_interes:           d.tasa_interes,
      porcentaje_pago_minimo: d.porcentaje_pago_minimo,
      fecha_limite:           d.fecha_limite,
      estado:                 d.estado,
      monthlyPayment:         d.monthlyPayment,
    })),
  );

  activeDebt = computed(() => this.simDebts()[this.activeDebtIndex()] ?? null);

  simulationResult = computed<SimulationResult | null>(() => {
    const debt = this.activeDebt();
    if (!debt) return null;
    return this.strategySvc.simulate(debt, this.monthlyPayment(), this.extraPayment());
  });

  strategyResult = computed<StrategyResult>(() => {
    const debts = this.simDebts();
    return this.activeStrategy() === 'snowball'
      ? this.strategySvc.snowball(debts)
      : this.strategySvc.avalanche(debts);
  });

  cmfPhase  = getActiveCmfPhase();
  cmfPhases = CMF_PHASES;

  pagoMinimoCmf = computed(() => {
    const debt = this.activeDebt();
    if (!debt) return 0;
    return this.strategySvc.calcPagoMinimo(
      debt.saldo_pendiente,
      this.cmfPhase.minPaymentFactor * 100,
    );
  });

  loadingApi = signal(false);
  apiError   = signal<string | null>(null);
  usingLocal = signal(true);

  constructor(
    public store: AppStore,
    private strategySvc: DebtStrategyService,
    private simulatorApi: SimulatorApiService,
  ) {
    addIcons({
      calculatorOutline, trendingDownOutline, snowOutline,
      informationCircleOutline, alertCircleOutline,
      refreshOutline, calendarOutline, chevronForwardOutline,
    });
  }

  ngOnInit(): void {
    const first = this.activeDebt();
    if (first) this.monthlyPayment.set(first.monthlyPayment || 50_000);
  }

  onMonthlyChange(event: Event): void {
    this.monthlyPayment.set(Number((event as CustomEvent).detail.value));
    this.apiError.set(null);
  }

  onExtraChange(event: Event): void {
    this.extraPayment.set(Number((event as CustomEvent).detail.value));
    this.apiError.set(null);
  }

  onStrategyChange(event: Event): void {
    this.activeStrategy.set((event as CustomEvent).detail.value as StrategyType);
  }

  selectDebt(index: number): void {
    this.activeDebtIndex.set(index);
    const debt = this.simDebts()[index];
    if (debt) this.monthlyPayment.set(debt.monthlyPayment || 50_000);
    this.extraPayment.set(0);
  }

  projectWithApi(): void {
    const debt = this.activeDebt();
    if (!debt) return;
    this.loadingApi.set(true);
    this.apiError.set(null);
    this.simulatorApi.project({
      debtId:          debt.creditorId,
      saldo_pendiente: debt.saldo_pendiente,
      tasa_interes:    debt.tasa_interes,
      monthlyPayment:  this.monthlyPayment(),
      extraPayment:    this.extraPayment(),
    }).subscribe({
      next: () => {
        this.loadingApi.set(false);
        this.usingLocal.set(false);
      },
      error: (err) => {
        this.loadingApi.set(false);
        this.usingLocal.set(true);
        this.apiError.set(err.message);
      },
    });
  }

  formatClp = (n: number) => this.strategySvc.formatClp(n);

  strategyDesc(type: StrategyType): string {
    return type === 'snowball'
      ? 'Paga primero la deuda de menor saldo. Victorias rápidas que reducen el estrés.'
      : 'Paga primero la tasa más alta. Máximo ahorro de dinero a largo plazo.';
  }
}
