import { Component, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardContent, IonIcon, IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  medalOutline, flameOutline, trophyOutline, starOutline,
  storefrontOutline, cartOutline, businessOutline, cardOutline,
  calculatorOutline, informationCircleOutline,
  chevronForwardOutline, calendarOutline, walletOutline,
} from 'ionicons/icons';

import { AppStore } from '../core/services/app.store';
import { CmfService } from '../core/services/cmf.service';
import { ClpPipe } from '../shared/pipes/clp.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, ClpPipe, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardContent, IonIcon, IonInput,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  // ── Todo viene del AppStore ───────────────────────────────────────
  freedomPercent = this.store.freedomPercent;
  totalPaid      = this.store.totalPaid;
  totalOriginal  = this.store.totalOriginal;
  achievements   = this.store.achievements;
  streak         = this.store.streak;
  distribution   = this.store.distribution;
  totalIncome    = this.store.totalIncome;
  totalCommitted = this.store.totalCommitted;
  available      = this.store.available;
  hasData        = this.store.hasData;
  debts          = computed(() => this.store.budget().debts);
  nextDue        = this.store.nextDue;

  availableClass = computed(() => {
    const pct = this.store.availablePercent();
    if (pct > 20) return 'ok';
    if (pct >= 0) return 'warn';
    return 'over';
  });

  // ── Conversor UF ──────────────────────────────────────────────────
  ufValue      = this.cmf.ufValue;
  lastUpdated  = this.cmf.lastUpdated;
  ufInputValue = signal<number | null>(null);

  ufResult = computed(() => {
    const v = this.ufInputValue();
    return (v != null && v > 0) ? this.cmf.toPesos(v) : null;
  });

  showCaePopover = signal(false);

  constructor(public store: AppStore, public cmf: CmfService) {
    addIcons({
      medalOutline, flameOutline, trophyOutline, starOutline,
      storefrontOutline, cartOutline, businessOutline, cardOutline,
      calculatorOutline, informationCircleOutline,
      chevronForwardOutline, calendarOutline, walletOutline,
    });
  }

  onUfInput(event: Event): void {
    const raw = (event as CustomEvent).detail?.value
      ?? (event.target as HTMLInputElement).value;
    const num = raw !== '' && raw != null ? Number(raw) : null;
    this.ufInputValue.set(num && !isNaN(num) ? num : null);
  }

  toggleCaePopover(): void {
    this.showCaePopover.update(v => !v);
  }

  // ── Helpers de deuda ─────────────────────────────────────────────
  // Usa los helpers del store que ya conocen el nuevo modelo DebtEntry
  creditorName(id: string):  string { return this.store.creditorName(id);  }
  creditorColor(id: string): string { return this.store.creditorColor(id); }
  creditorIcon(id: string):  string { return this.store.creditorIcon(id);  }
  debtPct(debt: any):        number { return this.store.debtPct(debt);     }
}
