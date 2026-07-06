import { Acreedor } from '../models/app.model';

// IDs deben coincidir con los que devuelve GET /api/acreedores
// Si el backend usa UUIDs, reemplazar estos valores con los reales
export const CREDITORS_SEED: Acreedor[] = [
  { id: 'falabella',    nombre: 'Falabella CMR',  tipo: 'retail', color: '#E24B4A', iconName: 'storefront-outline' },
  { id: 'ripley',       nombre: 'Ripley',          tipo: 'retail', color: '#EF9F27', iconName: 'cart-outline'       },
  { id: 'cajaAndes',    nombre: 'Caja Los Andes',  tipo: 'caja',   color: '#378ADD', iconName: 'business-outline'   },
  { id: 'bancoEstado',  nombre: 'BancoEstado',     tipo: 'banco',  color: '#1D9E75', iconName: 'card-outline'       },
];
