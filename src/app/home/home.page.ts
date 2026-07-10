import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  walletOutline, addOutline, personOutline,
  cardOutline, calculatorOutline, layersOutline,
  shieldCheckmarkOutline, flameOutline, cashOutline,
  informationOutline, ribbonOutline, medalOutline,
  chevronForwardOutline, timeOutline,
} from 'ionicons/icons';

import { AppStore } from '../core/services/app.store';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { SimulatorApiService } from '../core/services/simulator-api.service';
import { ClpPipe } from '../shared/pipes/clp.pipe';
import { Deuda } from '../core/models/app.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, ClpPipe]
})
export class HomePage implements OnInit {
  public store = inject(AppStore);
  private api = inject(ApiService);
  public auth = inject(AuthService);
  private simulatorApi = inject(SimulatorApiService);

  userName = computed(() => this.auth.userNombre() || 'USUARIO');
  fullName = this.auth.fullName;
  hasData = this.store.hasData;
  freedomPercent = this.store.freedomPercent;
  totalPagado = this.store.totalPagado;
  totalOriginal = this.store.totalOriginal;
  achievements = this.store.achievements;
  totalIncome = this.store.totalIncome;
  totalCommitted = this.store.totalCommitted;
  available = this.store.available;
  availablePercent = this.store.availablePercent;
  streak = this.store.streak;
  debts = this.store.deudas;

  financialHealth = computed(() => {
    const pct = this.freedomPercent();
    if (pct >= 80) return { label: 'CONTROLADO', color: '#1D9E75', glyph: '[ ▰▰▰ ]' };
    if (pct >= 50) return { label: 'ATENCION', color: '#378ADD', glyph: '[ ▰▰▱ ]' };
    if (pct >= 25) return { label: 'PRESION', color: '#EF9F27', glyph: '[ ▰▱▱ ]' };
    return { label: 'CRITICO', color: '#E24B4A', glyph: '[ ▱▱▱ ]' };
  });

  nextDue = this.store.nextDue;

  nextPaymentUrgency = computed(() => {
    const next = this.nextDue();
    if (!next) return null;
    const days = next.dias;
    if (days < 0) return { label: 'VENCIDA', color: '#E24B4A' };
    if (days <= 3) return { label: `${days} DIAS`, color: '#E24B4A' };
    if (days <= 7) return { label: `${days} DIAS`, color: '#EF9F27' };
    return { label: `${days} DIAS`, color: '#378ADD' };
  });

  dailyTip = computed(() => {
    const tips = [
      { text: 'Paga primero las deudas mas pequenas. Cada frente que cierras es una victoria.', action: 'Ir al simulador', route: '/simulador' },
      { text: 'Destinar $10.000 extra al mes puede reducir meses de intereses. Simula cuanto ahorrarias.', action: 'Simular ahora', route: '/simulador' },
      { text: 'Desde junio 2026, el pago minimo de tarjetas sube. Anticipa como te afecta.', action: 'Ver cronograma', route: '/simulador' },
      { text: 'El CAE incluye seguros y comisiones. Compara siempre por CAE, no solo por la tasa.', action: 'Ver deudas', route: '/deudas' },
    ];
    return tips[new Date().getDate() % tips.length];
  });

  availableClass = computed(() => {
    const pct = this.availablePercent();
    if (pct > 20) return 'ok';
    if (pct >= 0) return 'warn';
    return 'over';
  });

  ufValue = signal<number>(39450);
  lastUpdated = signal<string>('08 Jul');
  ufInputValue = signal<number>(0);
  simulaciones = signal<any[]>([]);

  ufResult(): number | null {
    const val = this.ufInputValue();
    return val > 0 ? Math.round(val * this.ufValue()) : null;
  }

  constructor() {
    addIcons({
      walletOutline, addOutline, personOutline,
      cardOutline, calculatorOutline, layersOutline,
      shieldCheckmarkOutline, flameOutline, cashOutline,
      informationOutline, ribbonOutline, medalOutline,
      chevronForwardOutline, timeOutline,
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.refreshDataFromServer();
    this.cargarSimulaciones();
  }

  private refreshDataFromServer() {
    const now = new Date();
    this.api.getPresupuesto(now.getMonth() + 1, now.getFullYear()).subscribe({
      error: (err) => { if (err.status !== 401) console.error('Error al recuperar presupuesto:', err); }
    });
    this.api.getDeudas().subscribe({
      error: (err) => { if (err.status !== 401) console.error('Error al cargar deudas:', err); }
    });
  }

  cargarSimulaciones(): void {
    this.simulatorApi.getHistorial().subscribe({
      next: (data) => this.simulaciones.set(data),
      error: () => {}
    });
  }

  creditorColor(acreedorId: string): string {
    const colores: Record<string, string> = {
      'falabella': '#CC4444', 'ripley': '#CC8833',
      'cajaAndes': '#4488CC', 'bancoEstado': '#339966',
    };
    return colores[acreedorId] || '#6b7280';
  }

  creditorIcon(acreedorId: string): string {
    const iconos: Record<string, string> = {
      'falabella': 'card-outline', 'ripley': 'card-outline',
      'cajaAndes': 'business-outline', 'bancoEstado': 'card-outline',
    };
    return iconos[acreedorId] || 'business-outline';
  }

  debtPct(d: Deuda): number {
    const monto = Number(d.monto_original) || 0;
    if (monto === 0) return 0;
    return Math.round(((monto - (Number(d.saldo_pendiente) || 0)) / monto) * 100);
  }

  onUfInput(event: any): void {
    const val = event?.target?.value;
    this.ufInputValue.set(val ? Number(val) : 0);
  }
}