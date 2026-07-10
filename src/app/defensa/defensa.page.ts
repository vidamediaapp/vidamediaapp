import { Component, signal, computed, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  shieldOutline, alertCircleOutline, chevronDownOutline,
  chevronUpOutline, businessOutline, documentTextOutline,
  openOutline, chevronForwardOutline, chatbubbleOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonIcon, IonSpinner,
} from '@ionic/angular/standalone';

import { AppStore } from '../core/services/app.store';
import { ApiService } from '../core/services/api.service';
import { ClpPipe } from '../shared/pipes/clp.pipe';
import { AnalisisFinanciero, Recomendacion, Beneficio } from '../core/models/app.model';

interface SituacionLegal {
  id: string;
  numero: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  color: 'red' | 'blue' | 'teal';
  ley: string;
  textoLey: string;
  accionLabel: string;
  accionUrl?: string;
  accionRoute?: string;
}

interface ChatMsg {
  role: 'bot' | 'user';
  text: string;
}

interface ChatRespuesta {
  keywords: string[];
  respuesta: string;
}

@Component({
  selector: 'app-defensa',
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonIcon, 
  ],
  templateUrl: './defensa.page.html',
  styleUrls: ['./defensa.page.scss'],
})
export class DefensaPage implements OnInit, AfterViewChecked {

  @ViewChild('chatEnd') chatEnd!: ElementRef;

  readonly quickPills = [
    '¿Que es el CAE?',
    '¿Cuando prescriben las deudas?',
    'Mis derechos como deudor',
    '¿Como salir del DICOM?',
    '¿Me pueden acosar por telefono?',
    '¿Que es la Ley de Insolvencia?',
    '¿Puedo prepagar sin multa?',
  ];

  readonly situaciones: SituacionLegal[] = [
    {
      id: 'acoso', numero: '01', titulo: 'Acoso de cobranza',
      subtitulo: 'Llamadas, mensajes o amenazas abusivas',
      descripcion: 'Tienes derecho a exigir que no te contacten fuera de horario laboral, en tu trabajo o mediante amenazas.',
      color: 'red', ley: 'Ley 19.496 — Art. 37',
      textoLey: 'Prohibe a las empresas contactar al deudor en horarios o lugares inadecuados, o usar metodos que afecten su honra o reputacion.',
      accionLabel: 'Denunciar al SERNAC',
      accionUrl: 'https://www.sernac.cl/portal/619/w3-propertyname-624.html',
    },
    {
      id: 'prepago', numero: '02', titulo: 'Derecho a prepago',
      subtitulo: 'Pagar antes sin penalizacion abusiva',
      descripcion: 'Puedes prepagar total o parcialmente cualquier credito sin penalizacion excesiva.',
      color: 'blue', ley: 'Ley 18.010 — Art. 10',
      textoLey: 'El deudor tiene derecho a prepagar en cualquier momento. La compensacion maxima es un mes de interes.',
      accionLabel: 'Calcular mi prepago', accionRoute: '/simulator',
    },
    {
      id: 'renegociacion', numero: '03', titulo: 'Renegociacion de deudas',
      subtitulo: 'Proceso concursal gratuito ante la SuperIR',
      descripcion: 'Si tu deuda supera tu capacidad de pago, puedes iniciar un proceso de renegociacion gratuito.',
      color: 'teal', ley: 'Ley 20.720',
      textoLey: 'Permite renegociar deudas cuando superan la capacidad de pago. Protege al deudor de embargos.',
      accionLabel: 'Iniciar en SuperIR',
      accionUrl: 'https://www.superir.gob.cl/personas/persona-deudora/',
    },
  ];

  private chatKb: ChatRespuesta[] = [
    {
      keywords: ['cae', 'tasa', 'interes'],
      respuesta: 'El CAE (Costo Anual Equivalente) incluye la tasa de interes + seguros + comisiones + otros cargos. Por ley, todas las instituciones deben informarte el CAE antes de firmar cualquier credito. Si no lo hicieron, puedes reclamar al SERNAC.',
    },
    {
      keywords: ['prescriben', 'prescripcion', 'vence', 'tiempo'],
      respuesta: 'Las deudas de tarjetas de credito y retail prescriben en 5 años desde que se hacen exigibles. Las deudas mercantiles en 2 años. La prescripcion no es automatica, debes alegarla ante un tribunal.',
    },
    {
      keywords: ['derechos', 'derecho', 'consumidor'],
      respuesta: 'Tus principales derechos como deudor:\n• No ser contactado fuera de horario habil (Ley 19.496)\n• Prepagar sin penalizacion abusiva (Ley 18.010)\n• Acceder a renegociacion gratuita (Ley 20.720)\n• Conocer el CAE antes de firmar\n• Ser eliminado del DICOM tras pagar',
    },
    {
      keywords: ['dicom', 'boletin', 'morosidad'],
      respuesta: 'Si ya pagaste la deuda, la empresa tiene 5 dias habiles para eliminar tu registro. Si no lo hacen, puedes reclamar al Boletin Comercial o al SERNAC. El registro se limpia automaticamente despues de 5 años.',
    },
    {
      keywords: ['acoso', 'acosar', 'telefono', 'llamadas', 'hostigamiento', 'amenaza'],
      respuesta: 'Segun la Ley 19.496, es ilegal que te llamen fuera del horario de 8:00 a 20:00, en tu lugar de trabajo sin permiso, o que usen lenguaje amenazante. Guarda evidencia y denuncia en sernac.cl o llama al 800 700 100.',
    },
    {
      keywords: ['insolvencia', 'superir', 'renegociacion', 'ley 20.720'],
      respuesta: 'La Ley 20.720 te permite renegociar todas tus deudas como persona natural ante la Superintendencia de Insolvencia (SuperIR). El proceso es 100% gratuito. Durante la negociacion, se suspenden los embargos y las llamadas de cobranza.',
    },
    {
      keywords: ['prepago', 'prepagar', 'multa', 'penalizacion'],
      respuesta: 'Tienes derecho a prepagar cualquier deuda en cualquier momento. La penalizacion maxima que pueden cobrarte es 1 mes de intereses calculado sobre el monto que prepagas. No pueden cobrarte mas que eso.',
    },
  ];

  private chatFallback = 'No tengo informacion especifica sobre eso. Te recomiendo consultar directamente en sernac.cl o llamar al 800 700 100 (numero gratuito de SERNAC).';

  openCard = signal<string | null>('acoso');
  loadingAnalisis = signal(true);
  analisis = signal<AnalisisFinanciero | null>(null);
  messages = signal<ChatMsg[]>([]);
  inputText = signal('');
  private shouldScroll = false;

  toggle(id: string): void {
    this.openCard.update(cur => cur === id ? null : id);
  }

  isOpen(id: string): boolean { return this.openCard() === id; }

  colorClass(color: string): string { return `num-${color}`; }

  showAlert = computed(() => {
    const a = this.analisis();
    return a ? a.ratioDeudaIngreso > 100 : false;
  });

  ratioActual = computed(() => {
    const a = this.analisis();
    return a ? a.ratioDeudaIngreso.toFixed(0) + '%' : '0%';
  });

  recomendaciones = computed(() => this.analisis()?.recomendaciones || []);
  beneficios = computed(() => this.analisis()?.beneficiosDisponibles || []);

  sendPill(text: string): void {
    this.messages.update(m => [...m, { role: 'user', text }]);
    const resp = this.getResponse(text);
    setTimeout(() => {
      this.messages.update(m => [...m, { role: 'bot', text: resp }]);
      this.shouldScroll = true;
    }, 400);
  }

  private getResponse(text: string): string {
    const lower = text.toLowerCase();
    for (const item of this.chatKb) {
      if (item.keywords.some(k => lower.includes(k))) {
        return item.respuesta;
      }
    }
    return this.chatFallback;
  }

  handleAction(s: SituacionLegal): void {
    if (s.accionUrl) window.open(s.accionUrl, '_blank');
    if (s.accionRoute) this.router.navigate([s.accionRoute]);
  }

  handleRecomendacion(r: Recomendacion): void {
    if (r.enlace) window.open(r.enlace, '_blank');
  }

  handleBeneficio(b: Beneficio): void {
    if (b.enlace) window.open(b.enlace, '_blank');
  }

  openSernac(): void {
    window.open('https://www.sernac.cl', '_blank');
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.chatEnd) {
      this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  ngOnInit(): void {
    this.cargarAnalisis();
  }

  private cargarAnalisis(): void {
    this.loadingAnalisis.set(true);
    this.api.getAnalisis().subscribe({
      next: (data) => {
        this.analisis.set(data);
        this.loadingAnalisis.set(false);
      },
      error: () => {
        this.loadingAnalisis.set(false);
        console.warn('No se pudo cargar el analisis financiero');
      }
    });
  }

  constructor(
    public store: AppStore,
    private router: Router,
    private api: ApiService,
  ) {
    addIcons({
      shieldOutline, alertCircleOutline, chevronDownOutline,
      chevronUpOutline, businessOutline, documentTextOutline,
      openOutline, chevronForwardOutline, chatbubbleOutline,
      informationCircleOutline,
    });
  }
}