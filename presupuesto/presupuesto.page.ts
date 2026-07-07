import { Component, signal, computed } from '@angular/core';
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
  chevronDownOutline, chevronUpOutline, closeCircleOutline, alertCircleOutline,
  calendarOutline, trendingDownOutline, timeOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonIcon, IonSpinner,
} from '@ionic/angular/standalone';

import { AppStore }  from '../core/services/app.store';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { ClpPipe } from '../shared/pipes/clp.pipe';
import {
  Acreedor, CreateDeudaDto, CreatePresupuestoDto, EstadoDeuda,
} from '../core/models/app.model';

// Seed de UI para acreedores (colores e íconos)
const UI_ACREEDORES: Acreedor[] = [
  { id: 'falabella',   nombreComercial: 'Falabella CMR',  tipo: 'retail', tasaInteresTipica: 44, porcentajePagoMinimo: 3, nivelAdvertencia: 'alto', notaEducativa: '', color: '#E24B4A', iconName: 'storefront-outline' },
  { id: 'ripley',      nombreComercial: 'Ripley',         tipo: 'retail', tasaInteresTipica: 38, porcentajePagoMinimo: 3, nivelAdvertencia: 'alto', notaEducativa: '', color: '#EF9F27', iconName: 'cart-outline'       },
  { id: 'cajaAndes',   nombreComercial: 'Caja Los Andes', tipo: 'caja',   tasaInteresTipica: 18, porcentajePagoMinimo: 3, nivelAdvertencia: 'medio', notaEducativa: '', color: '#378ADD', iconName: 'business-outline'   },
  { id: 'bancoEstado', nombreComercial: 'BancoEstado',    tipo: 'banco',  tasaInteresTipica: 12, porcentajePagoMinimo: 3, nivelAdvertencia: 'bajo', notaEducativa: '', color: '#1D9E75', iconName: 'card-outline'       },
];

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
export class PresupuestoPage {

  // Usa los acreedores del store si los cargó el backend, sino el seed local
  get creditors(): Acreedor[] {
    const fromApi = this.store.acreedores();
    return fromApi.length > 0
      ? fromApi.map(a => ({ ...a, color: UI_ACREEDORES.find(u => u.id === a.id)?.color ?? '#6b7280', iconName: UI_ACREEDORES.find(u => u.id === a.id)?.iconName ?? 'business-outline' }))
      : UI_ACREEDORES;
  }

  incomeForm: FormGroup;
  selectedCreditor    = signal<string | null>(null);
  configuredDebts     = signal<Array<{ id: string; acreedor: Acreedor; debtForm: FormGroup; paymentForm: FormGroup }>>([]);
  dropdownOpen        = signal(false);
  activeDebtForm      = signal<FormGroup | null>(null);
  activePaymentForm   = signal<FormGroup | null>(null);

  configuredIds        = computed(() => new Set(this.configuredDebts().map(d => d.id)));
  availableCreditors   = computed(() => this.creditors.filter(c => !this.configuredIds().has(c.id)));
  activeCreditorObj    = computed(() => this.creditors.find(c => c.id === this.selectedCreditor()) ?? null);

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

  saving   = signal(false);
  saved    = signal(false);
  apiError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public store: AppStore,
    private api: ApiService,
    private auth: AuthService,
  ) {
    addIcons({
      walletOutline, cashOutline, storefrontOutline, cartOutline,
      businessOutline, cardOutline, receiptOutline, reorderFourOutline,
      checkmarkOutline, addOutline, saveOutline, checkmarkCircleOutline,
      chevronDownOutline, chevronUpOutline, closeCircleOutline, alertCircleOutline,
      calendarOutline, trendingDownOutline, timeOutline,
    });

    this.incomeForm = this.fb.group({
      salario: [null, [Validators.min(0)]],
      extras:  [null, [Validators.min(0)]],
    });

    // Sincronizar con el store local
    this.incomeForm.get('salario')!.valueChanges.subscribe(v => {
      const p = this.store.presupuesto();
      if (p) this.store.setPresupuesto({ ...p, salario: Number(v) || 0 });
    });
    this.incomeForm.get('extras')!.valueChanges.subscribe(v => {
      const p = this.store.presupuesto();
      if (p) this.store.setPresupuesto({ ...p, extras: Number(v) || 0 });
    });
  }

  toggleDropdown(): void {
    if (this.availableCreditors().length > 0) this.dropdownOpen.update(v => !v);
  }

  selectCreditor(id: string): void {
    this.selectedCreditor.set(id);
    this.dropdownOpen.set(false);

    this.activePaymentForm.set(this.fb.group({
      monthlyPayment: [null, [Validators.required, Validators.min(1)]],
    }));

    this.activeDebtForm.set(this.fb.group({
      monto_original:         [null, [Validators.required, Validators.min(1)]],
      saldo_pendiente:        [null, [Validators.required, Validators.min(0)]],
      tasa_interes:           [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      porcentaje_pago_minimo: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      fecha_limite:           [null, [Validators.required]],
      estado:                 ['pendiente', [Validators.required]],
      total_cuotas:           [null, [Validators.min(1)]],
      cuotas_pagadas:         [null, [Validators.min(0)]],
      cuotas_sin_interes:     [0],
      mantencion:             [0],
      seguros:                [0],
      comisiones:             [0],
    }, { validators: [this.saldoNotExceedsMonto] }));
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

    // Actualizar pagosPlanificados en el store
    const p = this.store.presupuesto();
    if (p) {
      this.store.setPresupuesto({
        ...p,
        pagosPlanificados: { ...p.pagosPlanificados, [id]: payment },
      });
    }

    this.configuredDebts.update(list => [
      ...list.filter(d => d.id !== id),
      { id, acreedor, debtForm: df, paymentForm: pf },
    ]);
    this.cancelSelection();
  }

  removeConfigured(id: string): void {
    this.configuredDebts.update(list => list.filter(d => d.id !== id));
  }

  debtPct(form: FormGroup): number {
    const monto = Number(form.value.monto_original) || 0;
    const saldo = Number(form.value.saldo_pendiente) || 0;
    return monto === 0 ? 0 : Math.round(((monto - saldo) / monto) * 100);
  }

  pagoMinimo(form: FormGroup): number {
    return Math.ceil((Number(form.value.saldo_pendiente) || 0) * (Number(form.value.porcentaje_pago_minimo) || 0) / 100);
  }

  estadoColor(estado: string): string {
    return estado === 'pagada' ? '#1D9E75' : estado === 'vencida' ? '#E24B4A' : '#378ADD';
  }

  todayDate(): string { return new Date().toISOString().split('T')[0]; }

  onSave(): void {
    this.apiError.set(null);
    this.saving.set(true);

    const now = new Date();

    // 1. Guardar presupuesto en el backend
    const presupuestoDto: CreatePresupuestoDto = {
      mes:   now.getMonth() + 1,
      año:   now.getFullYear(),
      salario: Number(this.incomeForm.value.salario) || 0,
      extras:  Number(this.incomeForm.value.extras)  || 0,
      pagosPlanificados: Object.fromEntries(
        this.configuredDebts().map(d => [d.id, Number(d.paymentForm.value.monthlyPayment) || 0])
      ),
    };

    this.api.savePresupuesto(presupuestoDto).subscribe({
      next: () => this.saveDeudas(),
      error: (err) => {
        this.saving.set(false);
        this.apiError.set(err.message);
      },
    });
  }

  private saveDeudas(): void {
    const debts = this.configuredDebts();
    if (debts.length === 0) {
      this.finishSave();
      return;
    }

    let done = 0;
    for (const d of debts) {
      const f = d.debtForm.value;
      const dto: CreateDeudaDto = {
        acreedorId:             d.id,
        monto_original:         Number(f.monto_original)         || 0,
        saldo_pendiente:        Number(f.saldo_pendiente)        || 0,
        tasa_interes:           Number(f.tasa_interes)           || 0,
        porcentaje_pago_minimo: Number(f.porcentaje_pago_minimo) || 0,
        fecha_limite:           f.fecha_limite                   || '',
        estado:                 f.estado as EstadoDeuda,
        total_cuotas:           Number(f.total_cuotas)           || 0,
        cuotas_pagadas:         Number(f.cuotas_pagadas)         || 0,
        cuotas_sin_interes:     Number(f.cuotas_sin_interes)     || 0,
        mantencion:             Number(f.mantencion)             || 0,
        seguros:                Number(f.seguros)                || 0,
        comisiones:             Number(f.comisiones)             || 0,
      };

      this.api.createDeuda(dto).subscribe({
        next: () => { done++; if (done === debts.length) this.finishSave(); },
        error: (err) => { this.saving.set(false); this.apiError.set(err.message); },
      });
    }
  }

  private finishSave(): void {
    this.saving.set(false);
    this.saved.set(true);
    setTimeout(() => { this.saved.set(false); this.router.navigate(['/home']); }, 1200);
  }

  private saldoNotExceedsMonto(group: AbstractControl) {
    const monto = Number(group.get('monto_original')?.value)  || 0;
    const saldo = Number(group.get('saldo_pendiente')?.value) || 0;
    if (saldo > monto) {
      group.get('saldo_pendiente')!.setErrors({ saldoExceedsMonto: true });
      return { saldoExceedsMonto: true };
    }
    return null;
  }
}
