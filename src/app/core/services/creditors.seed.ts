import { Acreedor } from '../models/app.model';

export const CREDITORS_SEED: Acreedor[] = [
  { id: 'falabella',   nombreComercial: 'Falabella CMR',  tipo: 'retail', tasaInteresTipica: 44, porcentajePagoMinimo: 3, nivelAdvertencia: 'alto',  notaEducativa: '', color: '#E24B4A', iconName: 'storefront-outline' },
  { id: 'ripley',      nombreComercial: 'Ripley',         tipo: 'retail', tasaInteresTipica: 38, porcentajePagoMinimo: 3, nivelAdvertencia: 'alto',  notaEducativa: '', color: '#EF9F27', iconName: 'cart-outline'       },
  { id: 'cajaAndes',   nombreComercial: 'Caja Los Andes', tipo: 'caja',   tasaInteresTipica: 18, porcentajePagoMinimo: 3, nivelAdvertencia: 'medio', notaEducativa: '', color: '#378ADD', iconName: 'business-outline'   },
  { id: 'bancoEstado', nombreComercial: 'BancoEstado',    tipo: 'banco',  tasaInteresTipica: 12, porcentajePagoMinimo: 3, nivelAdvertencia: 'bajo',  notaEducativa: '', color: '#1D9E75', iconName: 'card-outline'       },
];
