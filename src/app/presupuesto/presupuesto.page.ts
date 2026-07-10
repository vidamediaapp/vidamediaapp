import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  walletOutline, cashOutline, businessOutline, cardOutline,
  checkmarkOutline, addOutline, saveOutline, checkmarkCircleOutline,
  chevronDownOutline, chevronUpOutline, closeCircleOutline,
  calendarOutline, trendingDownOutline, chevronForwardOutline,
  warningOutline, calculatorOutline, informationOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonIcon, IonAlert,
  ViewWillEnter,
} from '@ionic/angular/standalone';

import { AppStore } from '../core/services/app.store';
import { ApiService } from '../core/services/api.service';
import { ClpPipe } from '../shared/pipes/clp.pipe';
import {
  Acreedor, CreateDeudaDto, CreatePresupuestoDto, Deuda, EstadoDeuda,
} from '../core/models/app.model';

const UI_ACREEDORES: Acreedor[] = [
  { id: 'falabella',   nombreComercial: 'Falabella CMR',  tipo: 'retail', tasaInteresTipica: 44, porcentajePagoMinimo: 3, nivelAdvertencia: 'alto', notaEducativa: '', color: '#E24B4A', iconName: 'card-outline' },
  { id: 'ripley',      nombreComercial: 'Ripley',         tipo: 'retail', tasaInteresTipica: 38, porcentajePagoMinimo: 3, nivelAdvertencia: 'alto', notaEducativa: '', color: '#EF9F27', iconName: 'card-outline' },
  { id: 'cajaAndes',   nombreComercial: 'Caja Los Andes', tipo: 'caja',   tasaInteresTipica: 18, porcentajePagoMinimo: 3, nivelAdvertencia: 'medio', notaEducativa: '', color: '#378ADD', iconName: 'business-outline' },
  { id: 'bancoEstado', nombreComercial: 'BancoEstado',    tipo: 'banco',  tasaInteresTipica: 12, porcentajePagoMinimo: 3, nivelAdvertencia: 'bajo', notaEducativa: '', color: '#1D9E75', iconName: 'card-outline' },
];

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ClpPipe,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonIcon, IonAlert,
  ],
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss'],
})
export class PresupuestoPage implements OnInit, ViewWillEnter {

  get creditors(): Acreedor[] {
    const fromApi = this.store.acreedores();
    if (fromApi.length > 0) {
      return fromApi.map(a => ({
        ...a,
        color: UI_ACREEDORES.find(u => u.id === a.id)?.color ?? '#6b7280',
        iconName: UI_ACREEDORES.find(u => u.id === a.id)?.iconName ?? 'business-outline'
      }));
    }
    return UI_ACREEDORES;
  }

  incomeForm: FormGroup;
  selectedCreditor    = signal<string | null>(null);
  configuredDebts     = signal<Array<{ uid: string; id: string; acreedor: Acreedor; debtForm: FormGroup; paymentForm: FormGroup }>>([]);
  dropdownOpen        = signal(false);
  activeDebtForm      = signal<FormGroup | null>(null);
  activePaymentForm   = signal<FormGroup | null>(null);
  deleteConfirmOpen   = signal(false);
  deleteTargetUid     = signal<string | null>(null);
  private debtFormSubscription: any = null;
  private datosCargados = false;

  alertButtons = [
    { text: 'Cancelar', role: 'cancel' },
    { text: 'Eliminar', role: 'destructive', handler: () => this.confirmDelete() }
  ];

  configuredIds        = computed(() => new Set(this.configuredDebts().map(d => d.id)));
  availableCreditors   = computed(() => this.creditors.filter(c => !this.configuredIds().has(c.id)));
  activeCreditorObj    = computed(() => this.creditors.find(c => c.id === this.selectedCreditor()) ?? null);

  deleteMessage = computed(() => {
    const uid = this.deleteTargetUid();
    if (!uid) return '';
    const deuda = this.configuredDebts().find(d => d.uid === uid);
    return `Seguro que deseas eliminar la deuda de ${deuda?.acreedor.nombreComercial || 'este acreedor'}? Esta accion no se puede deshacer.`;
  });

  totalIncome      = this.store.totalIncome;
  totalCommitted   = this.store.totalCommitted;
  available        = this.store.available;
  availablePercent = this.store.availablePercent;

  cuotaMensualCalculada = computed(() => {
    const df = this.activeDebtForm();
    if (!df) return 0;
    const saldo = Number(df.value.saldo_pendiente) || 0;
    const totalCuotas = Number(df.value.total_cuotas) || 1;
    const tasaInteres = Number(df.value.tasa_interes) || 0;
    if (saldo <= 0) return 0;
    return this.calcularCuotaFija(saldo, tasaInteres, totalCuotas);
  });

  cuotaMinimaPosible = computed(() => {
    const df = this.activeDebtForm();
    if (!df) return 0;
    const saldo = Number(df.value.saldo_pendiente) || 0;
    const tasaInteres = Number(df.value.tasa_interes) || 0;
    const tasa = tasaInteres > 10 ? (tasaInteres / 12) / 100 : tasaInteres / 100;
    const interesMensual = saldo * tasa;
    return Math.ceil(interesMensual + 1000);
  });

  cuotasMaximasPorSaldo = computed(() => {
    const df = this.activeDebtForm();
    if (!df) return 60;
    const saldo = Number(df.value.saldo_pendiente) || 0;
    const cuotaMinima = this.cuotaMinimaPosible();
    const maxCuotas = Math.floor(saldo / cuotaMinima);
    return Math.min(Math.max(1, maxCuotas), 60);
  });

  validacionCuotas = computed(() => {
    const df = this.activeDebtForm();
    if (!df) return null;
    const totalCuotas = Number(df.value.total_cuotas) || 0;
    const cuotasMax = this.cuotasMaximasPorSaldo();
    
    if (totalCuotas > cuotasMax) {
      return `Con este saldo, el maximo de cuotas razonable es ${cuotasMax}.`;
    }
    if (totalCuotas < 1) {
      return 'El minimo es 1 cuota.';
    }
    return null;
  });

  validacionCuota = computed(() => {
    const pf = this.activePaymentForm();
    if (!pf) return null;
    const cuotaIngresada = Number(pf.value.monthlyPayment) || 0;
    const cuotaMinima = this.cuotaMinimaPosible();
    
    if (cuotaIngresada > 0 && cuotaIngresada < cuotaMinima) {
      return `La cuota minima para cubrir intereses es ${this.formatClpNumber(cuotaMinima)}.`;
    }
    return null;
  });
  
  availableClass = computed(() => {
    const pct = this.store.availablePercent();
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
  ) {
    addIcons({
      walletOutline, cashOutline, businessOutline, cardOutline,
      checkmarkOutline, addOutline, saveOutline, checkmarkCircleOutline,
      chevronDownOutline, chevronUpOutline, closeCircleOutline,
      calendarOutline, trendingDownOutline, chevronForwardOutline,
      warningOutline, calculatorOutline, informationOutline,
    });

    this.incomeForm = this.fb.group({
      salario: [null, [Validators.min(0)]],
      extras:  [null, [Validators.min(0)]],
    });

    this.incomeForm.get('salario')!.valueChanges.subscribe(v => {
      const p = this.store.presupuesto();
      if (p) {
        this.store.setPresupuesto({ ...p, salario: Number(v) || 0 });
      } else {
        const now = new Date();
        this.store.setPresupuesto({
          id: '',
          usuario: {} as any,
          mes: now.getMonth() + 1,
          año: now.getFullYear(),
          salario: Number(v) || 0,
          extras: 0,
          pagosPlanificados: {}
        });
      }
    });

    this.incomeForm.get('extras')!.valueChanges.subscribe(v => {
      const p = this.store.presupuesto();
      if (p) {
        this.store.setPresupuesto({ ...p, extras: Number(v) || 0 });
      } else {
        const now = new Date();
        this.store.setPresupuesto({
          id: '',
          usuario: {} as any,
          mes: now.getMonth() + 1,
          año: now.getFullYear(),
          salario: Number(this.incomeForm.get('salario')?.value) || 0,
          extras: Number(v) || 0,
          pagosPlanificados: {}
        });
      }
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  ionViewWillEnter(): void {
    if (!this.datosCargados) {
      this.cargarDatosIniciales();
    }
  }

  private cargarDatosIniciales(): void {
    if (this.datosCargados) return;
    this.datosCargados = true;

    this.api.getAcreedores().subscribe({
      next: () => console.log('Acreedores cargados'),
      error: () => console.warn('Usando acreedores locales')
    });

    const now = new Date();
    this.api.getPresupuesto(now.getMonth() + 1, now.getFullYear()).subscribe({
      next: (presupuesto) => {
        if (presupuesto) {
          this.incomeForm.patchValue({
            salario: presupuesto.salario,
            extras: presupuesto.extras,
          }, { emitEvent: false });
        } else {
          this.store.setPresupuesto({
            id: '',
            usuario: {} as any,
            mes: now.getMonth() + 1,
            año: now.getFullYear(),
            salario: 0,
            extras: 0,
            pagosPlanificados: {}
          });
        }
      },
      error: () => {
        this.store.setPresupuesto({
          id: '',
          usuario: {} as any,
          mes: now.getMonth() + 1,
          año: now.getFullYear(),
          salario: 0,
          extras: 0,
          pagosPlanificados: {}
        });
      }
    });

    this.api.getDeudas().subscribe({
      next: (deudas) => {
        if (deudas.length > 0 && this.configuredDebts().length === 0) {
          this.cargarDeudasExistentes(deudas);
        }
      },
      error: () => console.warn('No se pudieron cargar las deudas')
    });
  }

  private cargarDeudasExistentes(deudas: Deuda[]): void {
    const configuradas: Array<{ uid: string; id: string; acreedor: Acreedor; debtForm: FormGroup; paymentForm: FormGroup }> = [];
    
    for (const deuda of deudas) {
      const acreedor = this.creditors.find(c => c.id === deuda.acreedor.id);
      if (!acreedor) continue;

      const debtForm = this.fb.group({
        monto_original:         [deuda.monto_original, [Validators.required, Validators.min(1)]],
        saldo_pendiente:        [deuda.saldo_pendiente, [Validators.required, Validators.min(0)]],
        tasa_interes:           [deuda.tasa_interes, [Validators.required, Validators.min(0), Validators.max(100)]],
        porcentaje_pago_minimo: [deuda.porcentaje_pago_minimo, [Validators.required, Validators.min(0), Validators.max(100)]],
        fecha_limite:           [deuda.fecha_limite, [Validators.required]],
        estado:                 [deuda.estado, [Validators.required]],
        total_cuotas:           [deuda.total_cuotas || 12, [Validators.required, Validators.min(1)]],
        cuotas_pagadas:         [deuda.cuotas_pagadas || 0, [Validators.required, Validators.min(0)]],
        cuotas_sin_interes:     [deuda.cuotas_sin_interes || 0],
        mantencion:             [deuda.mantencion || 0],
        seguros:                [deuda.seguros || 0],
        comisiones:             [deuda.comisiones || 0],
      }, { validators: [this.saldoNotExceedsMonto] });

      const paymentForm = this.fb.group({
        monthlyPayment: [(deuda as any).cuotaMensual || (deuda as any).cuota_mensual || (deuda.porcentaje_pago_minimo 
          ? Math.ceil(deuda.saldo_pendiente * deuda.porcentaje_pago_minimo / 100) 
          : 50000), [Validators.required, Validators.min(1)]],
      });

      configuradas.push({ uid: crypto.randomUUID(), id: deuda.acreedor.id, acreedor, debtForm, paymentForm });
    }

    this.configuredDebts.set(configuradas);
  }

  toggleDropdown(): void {
    if (this.availableCreditors().length > 0) this.dropdownOpen.update(v => !v);
  }

  selectCreditor(id: string): void {
    this.selectedCreditor.set(id);
    this.dropdownOpen.set(false);

    if (this.debtFormSubscription) {
      this.debtFormSubscription.unsubscribe();
      this.debtFormSubscription = null;
    }

    const acreedor = this.creditors.find(c => c.id === id);

    const debtForm = this.fb.group({
      monto_original:         [null, [Validators.required, Validators.min(1)]],
      saldo_pendiente:        [null, [Validators.required, Validators.min(0)]],
      tasa_interes:           [acreedor?.tasaInteresTipica ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
      porcentaje_pago_minimo: [acreedor?.porcentajePagoMinimo ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
      fecha_limite:           [null, [Validators.required]],
      estado:                 ['pendiente', [Validators.required]],
      total_cuotas:           [12, [Validators.required, Validators.min(1), Validators.max(60)]],
      cuotas_pagadas:         [0, [Validators.required, Validators.min(0)]],
      cuotas_sin_interes:     [0],
      mantencion:             [0],
      seguros:                [0],
      comisiones:             [0],
    }, { validators: [this.saldoNotExceedsMonto] });

    this.activeDebtForm.set(debtForm);

    const paymentForm = this.fb.group({
      monthlyPayment: [0, [Validators.required, Validators.min(1)]],
    });

    this.activePaymentForm.set(paymentForm);

    this.debtFormSubscription = debtForm.valueChanges.subscribe(() => {
      this.recalcularCuota(debtForm, paymentForm);
    });

    setTimeout(() => this.recalcularCuota(debtForm, paymentForm), 100);
  }

  cancelSelection(): void {
    this.selectedCreditor.set(null);
    this.activeDebtForm.set(null);
    this.activePaymentForm.set(null);
    this.apiError.set(null);
    if (this.debtFormSubscription) {
      this.debtFormSubscription.unsubscribe();
      this.debtFormSubscription = null;
    }
  }

  confirmCreditor(): void {
    console.log('🔵 confirmCreditor llamado');

    const id = this.selectedCreditor();
    const df = this.activeDebtForm();
    const pf = this.activePaymentForm();
    const acreedor = this.creditors.find(c => c.id === id);

    console.log('id:', id, 'df:', !!df, 'pf:', !!pf, 'acreedor:', acreedor?.nombreComercial);

    if (!id || !df || !pf || !acreedor) {
      console.log('🔴 Faltan datos basicos');
      this.apiError.set('Error al confirmar. Intenta de nuevo.');
      return;
    }

    this.apiError.set(null);
    pf.markAllAsTouched();
    df.markAllAsTouched();

    console.log('pf.valid:', pf.valid, 'pf.value:', pf.value);
    console.log('df.valid:', df.valid, 'df.value:', df.value);

    if (pf.invalid) {
      console.log('🔴 pf invalido');
      this.apiError.set('Completa el campo de cuota mensual.');
      return;
    }

    if (df.invalid) {
      console.log('🔴 df invalido');
      this.apiError.set('Completa todos los campos obligatorios de la deuda.');
      return;
    }

    const totalCuotas = Number(df.value.total_cuotas) || 0;
    const cuotasMax = this.cuotasMaximasPorSaldo();
    const cuotaIngresada = Number(pf.value.monthlyPayment) || 0;
    const cuotaMinima = this.cuotaMinimaPosible();

    console.log('totalCuotas:', totalCuotas, 'cuotasMax:', cuotasMax);

    if (totalCuotas <= 0) {
      this.apiError.set('Debes indicar el total de cuotas.');
      return;
    }

    if (totalCuotas > cuotasMax) {
      this.apiError.set(`Con este saldo, el maximo de cuotas es ${cuotasMax}.`);
      return;
    }

    if (cuotaIngresada < cuotaMinima) {
      this.apiError.set(`La cuota minima debe ser ${this.formatClpNumber(cuotaMinima)} para cubrir intereses.`);
      return;
    }

    console.log('✅ Creando deuda...');

    const updatedDebtsList = [
      ...this.configuredDebts().filter(d => d.id !== id),
      { uid: crypto.randomUUID(), id, acreedor, debtForm: df, paymentForm: pf }
    ];

    const p = this.store.presupuesto();
    if (p) {
      this.store.setPresupuesto({
        ...p,
        pagosPlanificados: Object.fromEntries(
          updatedDebtsList.map(d => [d.id, Number(d.paymentForm.value.monthlyPayment) || 0])
        )
      });
    }

    this.configuredDebts.set(updatedDebtsList);
    console.log('✅ Deuda confirmada. Total:', this.configuredDebts().length);
    this.cancelSelection();
  }

  promptDelete(uid: string): void {
    this.deleteTargetUid.set(uid);
    this.deleteConfirmOpen.set(true);
  }

  confirmDelete(): void {
    const uid = this.deleteTargetUid();
    if (uid) {
      const deuda = this.configuredDebts().find(d => d.uid === uid);
      if (deuda) {
        const deudaEnStore = this.store.deudas().find(d => d.acreedor.id === deuda.id);
        if (deudaEnStore) {
          this.api.deleteDeuda(deudaEnStore.id).subscribe({
            next: () => {
              console.log('Deuda eliminada del backend');
              this.store.removeDeuda(deudaEnStore.id);
            },
            error: (err) => console.error('Error al eliminar deuda:', err)
          });
        }
      }
      
      this.configuredDebts.update(list => {
        const updatedList = list.filter(d => d.uid !== uid);
        const p = this.store.presupuesto();
        if (p) {
          this.store.setPresupuesto({
            ...p,
            pagosPlanificados: Object.fromEntries(
              updatedList.map(d => [d.id, Number(d.paymentForm.value.monthlyPayment) || 0])
            )
          });
        }
        return updatedList;
      });
    }
    this.deleteTargetUid.set(null);
  }

  debtPct(form: FormGroup): number {
    const monto = Number(form.value.monto_original) || 0;
    const saldo = Number(form.value.saldo_pendiente) || 0;
    return monto === 0 ? 0 : Math.round(((monto - saldo) / monto) * 100);
  }

  pagoMinimo(form: FormGroup): number {
    const saldo = Number(form.value.saldo_pendiente) || 0;
    const totalCuotas = Number(form.value.total_cuotas) || 1;
    const cuotasPagadas = Number(form.value.cuotas_pagadas) || 0;
    const tasaInteres = Number(form.value.tasa_interes) || 0;
    const cuotasRestantes = Math.max(1, totalCuotas - cuotasPagadas);
    return this.calcularCuotaFija(saldo, tasaInteres, cuotasRestantes);
  }

  estadoColor(estado: string): string {
    return estado === 'pagada' ? '#1D9E75' : estado === 'vencida' ? '#E24B4A' : '#378ADD';
  }

  todayDate(): string { return new Date().toISOString().split('T')[0]; }

  onSave(): void {
    this.apiError.set(null);
    
    const debts = this.configuredDebts();
    if (debts.length === 0) {
      this.apiError.set('Agrega al menos una deuda antes de guardar.');
      return;
    }

    for (const d of debts) {
      if (d.debtForm.invalid) {
        this.apiError.set(`Completa los datos de ${d.acreedor.nombreComercial} antes de guardar.`);
        return;
      }
      if (d.paymentForm.invalid) {
        this.apiError.set(`Completa la cuota de ${d.acreedor.nombreComercial} antes de guardar.`);
        return;
      }
    }

    this.saving.set(true);

    const now = new Date();

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
      next: (presupuestoCreado) => {
        if (presupuestoCreado) this.store.setPresupuesto(presupuestoCreado);
        this.saveDeudas();
      },
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
    const deudasSincronizadas: Deuda[] = [];

    for (const d of debts) {
      const f = d.debtForm.value;
      
      // Si la deuda ya existe en el store (tiene ID), actualizarla en lugar de crearla
      const deudaExistente = this.store.deudas().find(
        storeDeuda => storeDeuda.acreedor.id === d.id
      );

      if (deudaExistente) {
        // Actualizar deuda existente
        const dto: Partial<CreateDeudaDto> = {
          monto_original:         Number(f.monto_original)         || 0,
          saldo_pendiente:        Number(f.saldo_pendiente)        || 0,
          tasa_interes:           Number(f.tasa_interes)           || 0,
          porcentaje_pago_minimo: Number(f.porcentaje_pago_minimo) || 0,
          fecha_limite:           f.fecha_limite                   || '',
          estado:                 f.estado as EstadoDeuda,
          total_cuotas:           Number(f.total_cuotas)           || 12,
          cuotas_pagadas:         Number(f.cuotas_pagadas)         || 0,
          cuotas_sin_interes:     Number(f.cuotas_sin_interes)     || 0,
          mantencion:             Number(f.mantencion)             || 0,
          seguros:                Number(f.seguros)                || 0,
          comisiones:             Number(f.comisiones)             || 0,
        };

        this.api.updateDeuda(deudaExistente.id, dto).subscribe({
          next: (deudaActualizada) => {
            done++;
            if (deudaActualizada) deudasSincronizadas.push(deudaActualizada);
            if (done === debts.length) {
              if (deudasSincronizadas.length > 0) this.store.setDeudas(deudasSincronizadas);
              this.finishSave();
            }
          },
          error: (err) => {
            this.saving.set(false);
            this.apiError.set(err.message);
          },
        });
      } else {
        // Crear nueva deuda
        const dto: CreateDeudaDto = {
          acreedorId:             d.id,
          monto_original:         Number(f.monto_original)         || 0,
          saldo_pendiente:        Number(f.saldo_pendiente)        || 0,
          tasa_interes:           Number(f.tasa_interes)           || 0,
          porcentaje_pago_minimo: Number(f.porcentaje_pago_minimo) || 0,
          fecha_limite:           f.fecha_limite                   || '',
          estado:                 f.estado as EstadoDeuda,
          total_cuotas:           Number(f.total_cuotas)           || 12,
          cuotas_pagadas:         Number(f.cuotas_pagadas)         || 0,
          cuotas_sin_interes:     Number(f.cuotas_sin_interes)     || 0,
          mantencion:             Number(f.mantencion)             || 0,
          seguros:                Number(f.seguros)                || 0,
          comisiones:             Number(f.comisiones)             || 0,
        };

        this.api.createDeuda(dto).subscribe({
          next: (deudaCreada) => {
            done++;
            if (deudaCreada) deudasSincronizadas.push(deudaCreada);
            if (done === debts.length) {
              if (deudasSincronizadas.length > 0) this.store.setDeudas(deudasSincronizadas);
              this.finishSave();
            }
          },
          error: (err) => {
            this.saving.set(false);
            this.apiError.set(err.message);
          },
        });
      }
    }
}

  private finishSave(): void {
    this.saving.set(false);
    this.saved.set(true);

    setTimeout(() => { 
      this.saved.set(false); 
      this.router.navigate(['/home']); 
    }, 1200);
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

  private calcularCuotaFija(saldo: number, tasaMensual: number, totalCuotas: number): number {
    if (!saldo || !totalCuotas || totalCuotas <= 0) return 0;
    if (tasaMensual === 0) return Math.ceil(saldo / totalCuotas);
    const tasa = tasaMensual > 10 ? (tasaMensual / 12) / 100 : tasaMensual / 100;
    const cuota = saldo * (tasa * Math.pow(1 + tasa, totalCuotas)) / (Math.pow(1 + tasa, totalCuotas) - 1);
    return Math.ceil(cuota);
  }

  private recalcularCuota(debtForm: FormGroup, paymentForm: FormGroup): void {
    const saldo = Number(debtForm.value.saldo_pendiente) || 0;
    const totalCuotas = Number(debtForm.value.total_cuotas) || 1;
    const tasaInteres = Number(debtForm.value.tasa_interes) || 0;
    
    if (saldo > 0) {
      const cuotaCalculada = this.calcularCuotaFija(saldo, tasaInteres, totalCuotas);
      if (cuotaCalculada > 0) {
        paymentForm.get('monthlyPayment')?.setValue(cuotaCalculada, { emitEvent: false });
      }
    } else {
      paymentForm.get('monthlyPayment')?.setValue(0, { emitEvent: false });
    }
  }

  private formatClpNumber(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }
}