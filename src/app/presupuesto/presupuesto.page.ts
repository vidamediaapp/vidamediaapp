import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, walletOutline, cashOutline, storefrontOutline,
  cartOutline, businessOutline, cardOutline, receiptOutline,
  reorderFourOutline, checkmarkOutline, addOutline,
  saveOutline, alertCircleOutline, checkmarkCircleOutline,
  chevronDownOutline, chevronUpOutline,
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

  incomeForm:     FormGroup;
  creditorForms:  Record<CreditorId, FormGroup>;
  debtForms:      Record<CreditorId, FormGroup>;

  saved        = signal(false);
  showDebtFor  = signal<Set<CreditorId>>(new Set<CreditorId>());

  // Lee del AppStore (mismo que usa home)
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
  ) {
    addIcons({
      arrowBackOutline, walletOutline, cashOutline, storefrontOutline,
      cartOutline, businessOutline, cardOutline, receiptOutline,
      reorderFourOutline, checkmarkOutline, addOutline,
      saveOutline, alertCircleOutline, checkmarkCircleOutline,
      chevronDownOutline, chevronUpOutline,
    });

    this.incomeForm = this.fb.group({
      salary: [null, [Validators.min(0)]],
      extras: [null, [Validators.min(0)]],
    });

    this.creditorForms = {
      falabella:   this.fb.group({ payment: [null, [Validators.min(0)]] }),
      ripley:      this.fb.group({ payment: [null, [Validators.min(0)]] }),
      cajaAndes:   this.fb.group({ payment: [null, [Validators.min(0)]] }),
      bancoEstado: this.fb.group({ payment: [null, [Validators.min(0)]] }),
    };

    const debtGroup = () => this.fb.group({
      totalAmount:       [null, [Validators.min(0)]],
      totalInstallments: [null, [Validators.min(1)]],
      paidInstallments:  [null, [Validators.min(0)]],
    }, { validators: [this.paidNotExceedTotal] });

    this.debtForms = {
      falabella:   debtGroup(),
      ripley:      debtGroup(),
      cajaAndes:   debtGroup(),
      bancoEstado: debtGroup(),
    };

    // Sincronizar ingresos → AppStore (home lo leerá automáticamente)
    this.incomeForm.get('salary')!.valueChanges.subscribe(v =>
      this.store.setSalary(Number(v) || 0));
    this.incomeForm.get('extras')!.valueChanges.subscribe(v =>
      this.store.setExtras(Number(v) || 0));

    // Sincronizar cuotas → AppStore
    for (const c of CREDITORS) {
      this.creditorForms[c.id].get('payment')!.valueChanges.subscribe(v =>
        this.store.setCreditorPayment(c.id, Number(v) || 0));
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  debtPct(id: CreditorId): number {
    const f     = this.debtForms[id].value;
    const total = Number(f.totalInstallments) || 0;
    const paid  = Number(f.paidInstallments)  || 0;
    return total === 0 ? 0 : Math.round((Math.min(paid, total) / total) * 100);
  }

  paidLeft(id: CreditorId): { paid: number; left: number } {
    const f     = this.debtForms[id].value;
    const total = Number(f.totalInstallments) || 0;
    const paid  = Math.min(Number(f.paidInstallments) || 0, total);
    return { paid, left: total - paid };
  }

  showDebt(id: CreditorId): boolean { return this.showDebtFor().has(id); }

  toggleDebt(id: CreditorId): void {
    this.showDebtFor.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Guardar → escribe en AppStore → home se actualiza solo ────────
  onSave(): void {
    for (const c of CREDITORS) {
      if (this.showDebt(c.id) && this.debtForms[c.id].valid) {
        const f = this.debtForms[c.id].value;
        const debt: DebtEntry = {
          creditorId:        c.id,
          totalAmount:       Number(f.totalAmount)       || 0,
          totalInstallments: Number(f.totalInstallments) || 0,
          paidInstallments:  Number(f.paidInstallments)  || 0,
          monthlyPayment:    this.store.budget().creditorPayments[c.id],
        };
        this.store.upsertDebt(debt);  // ← AppStore actualiza, home reacciona
      }
    }
    this.saved.set(true);
    setTimeout(() => {
      this.saved.set(false);
      this.router.navigate(['/home']);  // vuelve al home con los datos reflejados
    }, 1200);
  }

  private paidNotExceedTotal(group: AbstractControl) {
    const total = Number(group.get('totalInstallments')?.value) || 0;
    const paid  = Number(group.get('paidInstallments')?.value)  || 0;
    return paid > total ? { paidExceedsTotal: true } : null;
  }
}
