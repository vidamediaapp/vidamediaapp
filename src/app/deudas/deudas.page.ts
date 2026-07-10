import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  cardOutline, addOutline, trashOutline, createOutline,
  calculatorOutline, chevronDownOutline, chevronUpOutline,
  chevronForwardOutline, businessOutline, storefrontOutline,
  cartOutline, timeOutline, warningOutline, checkmarkCircleOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonIcon,
} from '@ionic/angular/standalone';

import { AppStore } from '../core/services/app.store';
import { ApiService } from '../core/services/api.service';
import { ClpPipe } from '../shared/pipes/clp.pipe';
import { Deuda, EstadoDeuda } from '../core/models/app.model';

type FilterType = 'todas' | 'pendiente' | 'vencida' | 'pagada';

@Component({
  selector: 'app-deudas',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ClpPipe,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonIcon,
  ],
  templateUrl: './deudas.page.html',
  styleUrls: ['./deudas.page.scss'],
})
export class DeudasPage {

  readonly allDebts = this.store.deudas;
  readonly totalOriginal = this.store.totalOriginal;
  readonly totalPagado = this.store.totalPagado;

  activeFilter = signal<FilterType>('todas');

  filteredDebts = computed(() => {
    const f = this.activeFilter();
    const list = this.allDebts();
    if (f === 'todas') return list;
    return list.filter(d => d.estado === f);
  });

  expandedId = signal<string | null>(null);

  toggle(id: string): void {
    this.expandedId.update(cur => cur === id ? null : id);
  }

  isExpanded(id: string): boolean { return this.expandedId() === id; }

  retailDebts = computed(() =>
    this.filteredDebts().filter(d =>
      ['falabella', 'ripley'].includes(d.acreedor.id)));

  bancoDebts = computed(() =>
    this.filteredDebts().filter(d =>
      ['cajaAndes', 'bancoEstado'].includes(d.acreedor.id)));

  otherDebts = computed(() =>
    this.filteredDebts().filter(d =>
      !['falabella', 'ripley', 'cajaAndes', 'bancoEstado'].includes(d.acreedor.id)));

  pendientesCount = computed(() =>
    this.allDebts().filter(d => d.estado === 'pendiente').length);

  vencidasCount = computed(() =>
    this.allDebts().filter(d => d.estado === 'vencida').length);

  debtPct(d: Deuda): number {
    const monto = Number(d.monto_original) || 0;
    if (monto === 0) return 0;
    return Math.round(((monto - (Number(d.saldo_pendiente) || 0)) / monto) * 100);
  }

  estadoLabel(estado: EstadoDeuda): string {
    return estado === 'pendiente' ? 'PENDIENTE' :
           estado === 'vencida' ? 'VENCIDA' : 'PAGADA';
  }

  diasParaVencer(fechaLimite: string): number {
    const hoy = new Date();
    const limite = new Date(fechaLimite);
    return Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  fechaUrgente(d: Deuda): boolean {
    return d.estado !== 'pagada' && this.diasParaVencer(d.fecha_limite) <= 7;
  }

  creditorColor(deuda: Deuda): string {
    const colores: Record<string, string> = {
      'falabella': '#E24B4A',
      'ripley': '#EF9F27',
      'cajaAndes': '#378ADD',
      'bancoEstado': '#1D9E75',
    };
    return colores[deuda.acreedor.id] || '#6b7280';
  }

  creditorIcon(deuda: Deuda): string {
    const iconos: Record<string, string> = {
      'falabella': 'card-outline',
      'ripley': 'card-outline',
      'cajaAndes': 'business-outline',
      'bancoEstado': 'card-outline',
    };
    return iconos[deuda.acreedor.id] || 'card-outline';
  }

  cuotaMensual(deuda: Deuda): number {
    return (deuda as any).cuotaMensual || (deuda as any).cuota_mensual || 0;
  }

  eliminar(d: Deuda): void {
    if (confirm(`¿Eliminar la deuda de ${d.acreedor.nombreComercial}?`)) {
      this.api.deleteDeuda(d.id).subscribe({
        next: () => {
          this.store.removeDeuda(d.id);
          this.expandedId.set(null);
        },
        error: (err) => console.error('Error al eliminar deuda:', err)
      });
    }
  }

  irAlSimulador(): void {
    this.router.navigate(['/simulador']);
  }

  setFilter(f: FilterType): void {
    this.activeFilter.set(f);
    this.expandedId.set(null);
  }

  constructor(
    public store: AppStore,
    private api: ApiService,
    private router: Router,
  ) {
    addIcons({
      cardOutline, addOutline, trashOutline, createOutline,
      calculatorOutline, chevronDownOutline, chevronUpOutline,
      chevronForwardOutline, businessOutline, storefrontOutline,
      cartOutline, timeOutline, warningOutline, checkmarkCircleOutline,
    });
  }
}