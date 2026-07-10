import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  saveOutline, addOutline, receiptOutline,
  timeOutline, cashOutline, checkmarkCircleOutline,
  warningOutline, closeCircleOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonIcon,
} from '@ionic/angular/standalone';

import { AppStore } from '../core/services/app.store';
import { ApiService } from '../core/services/api.service';
import { PagosApiService } from '../core/services/pagos-api.service';
import { ClpPipe } from '../shared/pipes/clp.pipe';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ClpPipe,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonIcon,
  ],
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {

  form: FormGroup;
  guardando = signal(false);
  guardado = signal(false);
  error = signal<string | null>(null);
  pagos = signal<any[]>([]);
  cargandoPagos = signal(false);

  // Señales reactivas para el formulario
  deudaSeleccionada = signal<string>('');
  montoIngresado = signal<number>(0);

  readonly todayDate = new Date().toISOString().split('T')[0];
  deudas = this.store.deudas;

  deudasActivas = computed(() =>
    this.deudas().filter(d => d.estado !== 'pagada').length
  );

  totalPagadoHistorico = computed(() =>
    this.pagos().reduce((s, p) => s + Number(p.monto), 0)
  );

  totalPagadoEsteMes = computed(() => {
    const ahora = new Date();
    const mes = ahora.getMonth();
    const año = ahora.getFullYear();
    return this.pagos()
      .filter(p => {
        const fecha = new Date(p.fechaPago);
        return fecha.getMonth() === mes && fecha.getFullYear() === año;
      })
      .reduce((s, p) => s + Number(p.monto), 0);
  });

  interesAhorrado = computed(() => {
    const deudas = this.deudas();
    const ahora = new Date();
    const mes = ahora.getMonth();
    const año = ahora.getFullYear();
    const pagosEsteMes = this.pagos().filter(p => {
      const fecha = new Date(p.fechaPago);
      return fecha.getMonth() === mes && fecha.getFullYear() === año;
    });

    let total = 0;
    for (const pago of pagosEsteMes) {
      const deuda = deudas.find(d => d.id === pago.deuda?.id);
      if (deuda) {
        const tasa = Number(deuda.tasa_interes) || 0;
        const tasaMensual = tasa > 10 ? (tasa / 12) / 100 : tasa / 100;
        const mesesRestantes = Math.max(1, (Number(deuda.total_cuotas) || 12) - (Number(deuda.cuotas_pagadas) || 0));
        total += Number(pago.monto) * tasaMensual * mesesRestantes;
      }
    }
    return total;
  });

  mesesAdelantados = computed(() => {
    const deudas = this.deudas();
    let total = 0;
    for (const d of deudas) {
      if (d.estado === 'pagada') continue;
      const cuotaOriginal = Number((d as any).cuotaMensual) || Number((d as any).cuota_mensual) || 0;
      const pagosDeEstaDeuda = this.pagos().filter(p => p.deuda?.id === d.id);
      const pagoPromedio = pagosDeEstaDeuda.length > 0
        ? pagosDeEstaDeuda.reduce((s, p) => s + Number(p.monto), 0) / pagosDeEstaDeuda.length
        : cuotaOriginal;

      if (cuotaOriginal > 0 && pagoPromedio > cuotaOriginal) {
        const mesesOriginales = Number(d.saldo_pendiente) / cuotaOriginal;
        const mesesReales = Number(d.saldo_pendiente) / pagoPromedio;
        total += Math.round(mesesOriginales - mesesReales);
      }
    }
    return total;
  });

  comparacionMesPasado = computed(() => {
    const ahora = new Date();
    const esteMes = ahora.getMonth();
    const esteAño = ahora.getFullYear();
    const mesPasado = esteMes === 0 ? 11 : esteMes - 1;
    const añoPasado = esteMes === 0 ? esteAño - 1 : esteAño;

    const totalEsteMes = this.pagos()
      .filter(p => {
        const f = new Date(p.fechaPago);
        return f.getMonth() === esteMes && f.getFullYear() === esteAño;
      })
      .reduce((s, p) => s + Number(p.monto), 0);

    const totalMesPasado = this.pagos()
      .filter(p => {
        const f = new Date(p.fechaPago);
        return f.getMonth() === mesPasado && f.getFullYear() === añoPasado;
      })
      .reduce((s, p) => s + Number(p.monto), 0);

    return totalMesPasado > 0 ? totalEsteMes - totalMesPasado : null;
  });

 impactoPago = computed(() => {
    const deudaId = this.deudaSeleccionada();
    const monto = this.montoIngresado();

    if (!deudaId || monto <= 0) return null;

    const deuda = this.deudas().find(d => d.id === deudaId);
    if (!deuda) return null;

    const cuotaMensual = Number((deuda as any).cuotaMensual) 
                      || Number((deuda as any).cuota_mensual) 
                      || Number(deuda.cuotaMensual) 
                      || 0;

    const saldoActual = Number(deuda.saldo_pendiente) || 0;
    const cuotasPagadas = Number((deuda as any).cuotasPagadas) 
                       || Number((deuda as any).cuotas_pagadas) 
                       || Number(deuda.cuotas_pagadas) 
                       || 0;
    const totalCuotas = Number((deuda as any).totalCuotas) 
                     || Number((deuda as any).total_cuotas) 
                     || Number(deuda.total_cuotas) 
                     || 12;

    const cuotasCubiertas = cuotaMensual > 0 ? Math.floor(monto / cuotaMensual) : 0;
    const cubreCuota = cuotasCubiertas > 0;
    const nuevoSaldo = Math.max(0, saldoActual - monto);
    const faltanteParaCuota = cuotaMensual > 0 ? Math.max(0, cuotaMensual - (monto % cuotaMensual)) : 0;
    const nuevoMes = Math.min(cuotasPagadas + cuotasCubiertas, totalCuotas);

    return {
        cubreCuota,
        cuotasCubiertas,
        cuotaMensual,
        cuotasPagadas,
        totalCuotas,
        nuevoSaldo,
        faltanteParaCuota,
        nuevoMes,
    };
});

  pagosAgrupados = computed(() => {
    const map = new Map<string, any[]>();
    for (const p of this.pagos()) {
      const key = p.fechaPago?.slice(0, 7) || 'sin-fecha';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, arr]) => ({
        key,
        label: this.formatMes(key),
        pagos: arr,
        total: arr.reduce((s, p) => s + Number(p.monto), 0),
      }));
  });

  constructor(
    private fb: FormBuilder,
    public store: AppStore,
    private api: ApiService,
    private pagosApi: PagosApiService,
  ) {
    addIcons({
      saveOutline, addOutline, receiptOutline,
      timeOutline, cashOutline, checkmarkCircleOutline,
      warningOutline, closeCircleOutline,
    });

    this.form = this.fb.group({
      deudaId: ['', [Validators.required]],
      monto: [null, [Validators.required, Validators.min(1)]],
    });

   
    this.form.get('deudaId')!.valueChanges.subscribe(v => this.deudaSeleccionada.set(v || ''));
    this.form.get('monto')!.valueChanges.subscribe(v => this.montoIngresado.set(Number(v) || 0));
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.api.getDeudas().subscribe({
      next: () => this.cargarTodosPagos(),
      error: () => this.cargarTodosPagos()
    });
  }

  cargarTodosPagos(): void {
    this.cargandoPagos.set(true);
    this.pagosApi.obtenerTodosPagos().subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.cargandoPagos.set(false);
      },
      error: () => {
        this.pagos.set([]);
        this.cargandoPagos.set(false);
      }
    });
  }

  onGuardar(): void {
    this.form.markAllAsTouched();
    this.error.set(null);

    if (this.form.invalid) {
      this.error.set('Completa todos los campos.');
      return;
    }

    const { deudaId, monto } = this.form.value;
    this.guardando.set(true);

    this.pagosApi.registrarPago(deudaId, Number(monto)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.set(true);
        this.form.patchValue({ monto: null });
        this.form.get('monto')!.markAsUntouched();
        this.montoIngresado.set(0);
        this.api.getDeudas().subscribe({
          next: (deudas) => this.store.setDeudas(deudas)
        });
        this.cargarDatos();
        setTimeout(() => this.guardado.set(false), 2000);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.message || 'Error al registrar pago');
      }
    });
  }

  eliminarPago(pago: any): void {
    const nombre = this.creditorName(pago.deuda?.id);
    if (!confirm(`¿Eliminar el pago de ${nombre} por ${this.formatClp(pago.monto)}?`)) return;
    if (!pago.deuda?.id) {
      this.error.set('Error: No se pudo identificar la deuda asociada');
      return;
    }

    this.pagosApi.eliminarPago(pago.id, pago.deuda.id).subscribe({
      next: () => {
        this.pagos.update(list => list.filter(p => p.id !== pago.id));
        this.api.getDeudas().subscribe({
          next: (deudas) => this.store.setDeudas(deudas)
        });
      },
      error: (err) => this.error.set(err.message || 'Error al eliminar pago')
    });
  }

  formatFecha(fecha: string): string {
    try {
      return new Date(fecha + 'T12:00:00')
        .toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return fecha; }
  }

  formatMes(key: string): string {
    if (key === 'sin-fecha') return 'Sin fecha';
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1)
      .toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  }

  formatClp(n: number): string {
    if (isNaN(n) || n === null || n === undefined) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(n);
  }

  creditorColor(deudaId: string): string {
    const deuda = this.deudas().find(d => d.id === deudaId);
    if (!deuda) return '#6b7280';
    const colores: Record<string, string> = {
      'falabella': '#CC4444', 'ripley': '#CC8833',
      'cajaAndes': '#4488CC', 'bancoEstado': '#339966',
    };
    return colores[deuda.acreedor.id] || '#6b7280';
  }

  creditorIcon(deudaId: string): string {
    const deuda = this.deudas().find(d => d.id === deudaId);
    if (!deuda) return 'card-outline';
    const iconos: Record<string, string> = {
      'falabella': 'card-outline', 'ripley': 'card-outline',
      'cajaAndes': 'business-outline', 'bancoEstado': 'card-outline',
    };
    return iconos[deuda.acreedor.id] || 'card-outline';
  }

  creditorName(deudaId: string): string {
    const deuda = this.deudas().find(d => d.id === deudaId);
    return deuda?.acreedor?.nombreComercial || 'Desconocido';
  }
}