export interface CmfPhase {
  label: string;
  description: string;
  validFrom: string;
  minPaymentFactor: number;
}

export const CMF_PHASES: CmfPhase[] = [
  {
    label: 'Fase 0',
    description: 'Pago mínimo actual',
    validFrom: '2024-01-01',
    minPaymentFactor: 0
  },
  {
    label: 'Fase 1 (25%)',
    description: 'Jun 2026 - Nov 2026',
    validFrom: '2026-06-04',
    minPaymentFactor: 0.25
  },
  {
    label: 'Fase 2 (50%)',
    description: 'Dic 2026 - May 2027',
    validFrom: '2026-12-04',
    minPaymentFactor: 0.50
  },
  {
    label: 'Fase 3 (75%)',
    description: 'Jun 2027 - Nov 2027',
    validFrom: '2027-06-04',
    minPaymentFactor: 0.75
  },
  {
    label: 'Fase 4 (100%)',
    description: 'Dic 2027 en adelante',
    validFrom: '2027-12-04',
    minPaymentFactor: 1
  }
];

export function getActiveCmfPhase(): CmfPhase {
  const hoy = new Date();
  const fases = [...CMF_PHASES].reverse();
  for (const fase of fases) {
    if (hoy >= new Date(fase.validFrom)) {
      return fase;
    }
  }
  return CMF_PHASES[0];
}