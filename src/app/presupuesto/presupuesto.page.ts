import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  walletOutline, cashOutline, storefrontOutline, cartOutline,
  businessOutline, cardOutline, receiptOutline, reorderFourOutline,
  checkmarkOutline, addOutline, saveOutline, checkmarkCircleOutline,
  chevronDownOutline, chevronUpOutline, closeCircleOutline,
  alertCircleOutline, calendarOutline, trendingDownOutline,
  timeOutline, refreshOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonIcon, IonSpinner,
} from '@ionic/angular/standalone';

import { AppStore } from '../core/services/app.store';
import { DeudaApiService } from '../core/services/deuda-api.service';
import { ClpPipe } from '../shared/pipes/clp.pipe';
import { Acreedor, CreateDeudaDto, DebtEntry, EstadoDeuda } from '../core/models/app.model';
import { CREDITORS_SEED } from '../core/services/creditors.seed';

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ClpPipe,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonIcon, IonSpinner,
  ],
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss'],
})
export class PresupuestoPage implements OnInit {

  // Acreedores — se cargan del seed local o del backend
  creditors = CREDITORS_SEED;

  // ── Formulario de ingresos ────────────────────────────────────────
  incomeForm: FormGroup;

  // ── Selector en cascada ───────────────────────────────────────────
  selectedCreditor = signal<string | null>(null);
  configuredDebts  = signal<Array<{ id: string; acreedor: Acreedor; form: FormGroup; paymentForm: FormGroup }>>([]);
  dropdownOpen     = signal(false);
  activeDebtForm   = signal<FormGroup | null>(null);
  activePaymentForm = signal<FormGroup | null>(null);

  configuredIds = computed(() => new Set(this.configuredDebts().map(d => d.id)));
  availableCreditors = computed(() => this.creditors.filter(c => !this.configuredIds().has(c.id)));
  activeCreditorObj  = computed(() => this.creditors.find(c => c.id === this.selectedCreditor()) ?? null);

  // ── Estado de API ─────────────────────────────────────────────────
  saving   = signal(false);
  saved    = signal(false);
  apiError = signal<string | null>(null);
  loadingCreditors = signal(false);

  // ── Store ─────────────────────────────────────────────────────────
  totalIncome      = this.store.totalIncome;
  totalCommitted   = this.store.totalCommitted;
  available        = this.store.available;
  availablePercent = this.store.availablePercent;

  availableClass = computed(() => {
    const pct = this.availablePercent();
    if (pct > 20) return 'ok';
    if (pct >= 0) return 'warn';
    return 'over';
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public store: AppStore,
    private api: DeudaApiService,
  ) {
    addIcons({
      walletOutline, cashOutline, storefrontOutline, cartOutline,
      businessOutline, cardOutline, receiptOutline, reorderFourOutline,
      checkmarkOutline, addOutline, saveOutline, checkmarkCircleOutline,
      chevronDownOutline, chevronUpOutline, closeCircleOutline,
      alertCircleOutline, calendarOutline, trendingDownOutline,
      timeOutline, refreshOutline,
    });

    this.incomeForm = this.fb.group({
      salary: [null, [Validators.min(0)]],
      extras: [null, [Validators.min(0)]],
    });

    this.incomeForm.get('salary')!.valueChanges.subscribe(v =>
      this.store.setSalary(Number(v) || 0));
    this.incomeForm.get('extras')!.valueChanges.subscribe(v =>
      this.store.setExtras(Number(v) || 0));
  }

  ngOnInit(): void {
    // Opcional: cargar acreedores desde el backend
    // this.loadAcreedores();
  }

  // ── Cargar acreedores desde el backend ───────────────────────────
  loadAcreedores(): void {
    this.loadingCreditors.set(true);
    this.api.getAcreedores().subscribe({
      next: (acreedores) => {
        // Enriquecer con color e icono del seed local
        this.creditors = acreedores.map(a => {
          const seed = CREDITORS_SEED.find(s => s.id === a.id);
          return { ...a, color: seed?.color ?? '#6b7280', iconName: seed?.iconName ?? 'business-outline' };
        });
        this.loadingCreditors.set(false);
      },
      error: () => this.loadingCreditors.set(false),
    });
  }

  // ── Selector en cascada ───────────────────────────────────────────
  toggleDropdown(): void {
    if (this.availableCreditors().length === 0) return;
    this.dropdownOpen.update(v => !v);
  }

  selectCreditor(id: string): void {
    this.selectedCreditor.set(id);
    this.dropdownOpen.set(false);

    // Formulario de cuota mensual (campo extra del frontend)
    this.activePaymentForm.set(this.fb.group({
      monthlyPayment: [null, [Validators.required, Validators.min(1)]],
    }));

    // Formulario con todos los campos del modelo Deuda del backend
    this.activeDebtForm.set(this.fb.group({
      monto_original:          [null, [Validators.required, Validators.min(1)]],
      saldo_pendiente:         [null, [Validators.required, Validators.min(0)]],
      tasa_interes:            [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      porcentaje_pago_minimo:  [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      fecha_limite:            [null, [Validators.required]],
      estado:                  ['pendiente', [Validators.required]],
      cuotas_totales:          [null, [Validators.min(1)]],
      cuotas_pagadas:          [null, [Validators.min(0)]],
    }, { validators: [this.saldoNotExceedsMonto, this.cuotasPagadasNotExceed] }));
  }

  cancelSelection(): void {
    this.selectedCreditor.set(null);
    this.activeDebtForm.set(null);
    this.activePaymentForm.set(null);
  }

  confirmCreditor(): void {
    const id       = this.selectedCreditor();
    const df       = this.activeDebtForm();
    const pf       = this.activePaymentForm();
    const acreedor = this.creditors.find(c => c.id === id);
    if (!id || !df || !pf || !acreedor) return;

    pf.markAllAsTouched();
    df.markAllAsTouched();
    if (pf.invalid || df.invalid) return;

    const payment = Number(pf.value.monthlyPayment) || 0;
    this.store.setCreditorPayment(id, payment);

    const entry: DebtEntry = {
      creditorId:             id,
      monto_original:         Number(df.value.monto_original)         || 0,
      saldo_pendiente:        Number(df.value.saldo_pendiente)        || 0,
      tasa_interes:           Number(df.value.tasa_interes)           || 0,
      porcentaje_pago_minimo: Number(df.value.porcentaje_pago_minimo) || 0,
      fecha_limite:           df.value.fecha_limite                   || '',
      estado:                 df.value.estado                         as EstadoDeuda,
      monthlyPayment:         payment,
      cuotasTotales:          Number(df.value.cuotas_totales)         || 0,
      cuotasPagadas:          Number(df.value.cuotas_pagadas)         || 0,
    };
    this.store.upsertDebt(entry);

    this.configuredDebts.update(list => [
      ...list.filter(d => d.id !== id),
      { id, acreedor, form: df, paymentForm: pf },
    ]);

    this.cancelSelection();
  }

  removeConfigured(id: string): void {
    this.configuredDebts.update(list => list.filter(d => d.id !== id));
    this.store.removeDebt(id);
  }

  // ── Guardar → POST a /api/deudas ─────────────────────────────────
  onSave(): void {
    this.apiError.set(null);
    this.saving.set(true);

    const debts = this.store.budget().debts;

    if (debts.length === 0) {
      // Si no hay deudas, solo guardar localmente y volver
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => { this.saved.set(false); this.router.navigate(['/home']); }, 1200);
      return;
    }

    // Crear todas las deudas en el backend en secuencia
    let completed = 0;
    let hasError  = false;

    for (const debt of debts) {
      const dto: CreateDeudaDto = {
        monto_original:         debt.monto_original,
        saldo_pendiente:        debt.saldo_pendiente,
        tasa_interes:           debt.tasa_interes,
        porcentaje_pago_minimo: debt.porcentaje_pago_minimo,
        fecha_limite:           debt.fecha_limite,
        estado:                 debt.estado,
        acreedorId:             debt.creditorId,
      };

      this.api.createDeuda(dto).subscribe({
        next: () => {
          completed++;
          if (completed === debts.length && !hasError) {
            this.saving.set(false);
            this.saved.set(true);
            setTimeout(() => {
              this.saved.set(false);
              this.router.navigate(['/home']);
            }, 1200);
          }
        },
        error: (err) => {
          if (!hasError) {
            hasError = true;
            this.saving.set(false);
            this.apiError.set(err.message ?? 'No se pudo guardar. Verifica tu conexión.');
          }
        },
      });
    }
  }

  // ── Helpers de progreso ───────────────────────────────────────────
  debtPct(form: FormGroup): number {
    const monto  = Number(form.value.monto_original)  || 0;
    const saldo  = Number(form.value.saldo_pendiente) || 0;
    if (monto === 0) return 0;
    return Math.round(((monto - saldo) / monto) * 100);
  }

  saldoLabel(form: FormGroup): string {
    const monto = Number(form.value.monto_original)  || 0;
    const saldo = Number(form.value.saldo_pendiente) || 0;
    return this.store.formatClp(monto - saldo);
  }

  pagoMinimo(form: FormGroup): number {
    const saldo = Number(form.value.saldo_pendiente)        || 0;
    const pct   = Number(form.value.porcentaje_pago_minimo) || 0;
    return Math.ceil(saldo * pct / 100);
  }

  estadoColor(estado: string): string {
    switch (estado) {
      case 'pagada':   return '#1D9E75';
      case 'vencida':  return '#E24B4A';
      default:         return '#378ADD';
    }
  }

  todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ── Validadores de grupo ──────────────────────────────────────────
  private saldoNotExceedsMonto(group: AbstractControl) {
    const monto = Number(group.get('monto_original')?.value)  || 0;
    const saldo = Number(group.get('saldo_pendiente')?.value) || 0;
    if (saldo > monto) {
      group.get('saldo_pendiente')!.setErrors({ saldoExceedsMonto: true });
      return { saldoExceedsMonto: true };
    }
    return null;
  }

  private cuotasPagadasNotExceed(group: AbstractControl) {
    const total  = Number(group.get('cuotas_totales')?.value)  || 0;
    const pagadas = Number(group.get('cuotas_pagadas')?.value) || 0;
    if (pagadas > total && total > 0) {
      group.get('cuotas_pagadas')!.setErrors({ exceedsTotal: true });
      return { cuotasExceedsTotal: true };
    }
    return null;
  }
}
