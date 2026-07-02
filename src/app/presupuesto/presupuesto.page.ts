import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, walletOutline, cashOutline, storefrontOutline,
  cartOutline, businessOutline, cardOutline, receiptOutline,
  reorderFourOutline, checkmarkOutline, addOutline,
  saveOutline, checkmarkCircleOutline,
  chevronDownOutline, chevronUpOutline, chevronForwardOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonIcon,
} from '@ionic/angular/standalone';

import { AppStore } from '../core/services/app.store';
import { ClpPipe } from '../shared/pipes/clp.pipe';
import { CreditorId, DebtEntry } from '../core/models/app.model';
import { CREDITORS } from '../core/services/creditors.seed';

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ClpPipe,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonIcon,
  ],
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss'],
})
export class PresupuestoPage {

  readonly creditors = CREDITORS;

  // ── Formulario de ingresos ────────────────────────────────────────
  incomeForm: FormGroup;

  // ── Selector en cascada ───────────────────────────────────────────
  // Cuál acreedor está seleccionado actualmente en el selector
  selectedCreditor = signal<CreditorId | null>(null);

  // Lista de deudas ya configuradas (pueden ser varias)
  configuredDebts = signal<
    Array<{ id: CreditorId; form: FormGroup; payment: number }>
  >([]);

  // ¿Está desplegado el dropdown de acreedores?
  dropdownOpen = signal(false);

  // Formulario activo (para el acreedor seleccionado)
  activeDebtForm = signal<FormGroup | null>(null);
  activePaymentForm = signal<FormGroup | null>(null);

  // Acreedores ya configurados (para no mostrarlos de nuevo en el dropdown)
  configuredIds = computed(() =>
    new Set(this.configuredDebts().map(d => d.id)));

  // Acreedores disponibles (no configurados aún)
  availableCreditors = computed(() =>
    this.creditors.filter(c => !this.configuredIds().has(c.id)));

  // Acreedor activo como objeto completo
  activeCreditorObj = computed(() =>
    this.creditors.find(c => c.id === this.selectedCreditor()) ?? null);

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

  saved = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public store: AppStore,
  ) {
    addIcons({
      arrowBackOutline, walletOutline, cashOutline, storefrontOutline,
      cartOutline, businessOutline, cardOutline, receiptOutline,
      reorderFourOutline, checkmarkOutline, addOutline,
      saveOutline, checkmarkCircleOutline,
      chevronDownOutline, chevronUpOutline, chevronForwardOutline,
      closeCircleOutline,
    });

    this.incomeForm = this.fb.group({
      salary: [null, [Validators.min(0)]],
      extras: [null, [Validators.min(0)]],
    });

    // Sincronizar ingresos → AppStore
    this.incomeForm.get('salary')!.valueChanges.subscribe(v =>
      this.store.setSalary(Number(v) || 0));
    this.incomeForm.get('extras')!.valueChanges.subscribe(v =>
      this.store.setExtras(Number(v) || 0));
  }

  // ── Selector en cascada ───────────────────────────────────────────

  toggleDropdown(): void {
    // Solo abrir si quedan acreedores disponibles
    if (this.availableCreditors().length > 0) {
      this.dropdownOpen.update(v => !v);
    }
  }

  selectCreditor(id: CreditorId): void {
    this.selectedCreditor.set(id);
    this.dropdownOpen.set(false);

    // Crear formularios para este acreedor
    this.activeDebtForm.set(this.fb.group({
      totalAmount:       [null, [Validators.min(0)]],
      totalInstallments: [null, [Validators.min(1)]],
      paidInstallments:  [null, [Validators.min(0)]],
    }, { validators: [this.paidNotExceedTotal] }));

    this.activePaymentForm.set(this.fb.group({
      payment: [null, [Validators.min(0)]],
    }));
  }

  cancelSelection(): void {
    this.selectedCreditor.set(null);
    this.activeDebtForm.set(null);
    this.activePaymentForm.set(null);
  }

  // Confirmar acreedor actual y agregar a la lista configurada
  confirmCreditor(): void {
    const id = this.selectedCreditor();
    const debtForm = this.activeDebtForm();
    const payForm  = this.activePaymentForm();
    if (!id || !debtForm || !payForm) return;

    const payment = Number(payForm.value.payment) || 0;
    const f       = debtForm.value;

    // Guardar en el store
    this.store.setCreditorPayment(id, payment);

    if (debtForm.valid && f.totalInstallments) {
      const debt: DebtEntry = {
        creditorId:        id,
        totalAmount:       Number(f.totalAmount)       || 0,
        totalInstallments: Number(f.totalInstallments) || 0,
        paidInstallments:  Number(f.paidInstallments)  || 0,
        monthlyPayment:    payment,
      };
      this.store.upsertDebt(debt);
    }

    // Agregar a la lista visible configurada
    this.configuredDebts.update(list => [
      ...list.filter(d => d.id !== id),
      { id, form: debtForm, payment },
    ]);

    // Limpiar selección activa
    this.cancelSelection();
  }

  removeConfigured(id: CreditorId): void {
    this.configuredDebts.update(list => list.filter(d => d.id !== id));
    this.store.setCreditorPayment(id, 0);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  debtPct(form: FormGroup): number {
    const total = Number(form.value.totalInstallments) || 0;
    const paid  = Number(form.value.paidInstallments)  || 0;
    return total === 0 ? 0 : Math.round((Math.min(paid, total) / total) * 100);
  }

  paidLeft(form: FormGroup): { paid: number; left: number } {
    const total = Number(form.value.totalInstallments) || 0;
    const paid  = Math.min(Number(form.value.paidInstallments) || 0, total);
    return { paid, left: total - paid };
  }

  creditorById(id: CreditorId) {
    return this.creditors.find(c => c.id === id)!;
  }

  // ── Guardar todo ──────────────────────────────────────────────────
  onSave(): void {
    this.saved.set(true);
    setTimeout(() => {
      this.saved.set(false);
      this.router.navigate(['/home']);
    }, 1200);
  }

  private paidNotExceedTotal(group: AbstractControl) {
    const total = Number(group.get('totalInstallments')?.value) || 0;
    const paid  = Number(group.get('paidInstallments')?.value)  || 0;
    return paid > total ? { paidExceedsTotal: true } : null;
  }
}
