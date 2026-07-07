export interface CmfPhase {
  label: string;
  validFrom: string;        // 'YYYY-MM-DD'
  minPaymentFactor: number; // % del saldo como pago mínimo
  description: string;
}

export const CMF_PHASES: CmfPhase[] = [
  {
    label: 'Fase 1 — vigente',
    validFrom: '2026-06-01',
    minPaymentFactor: 0.03,
    description: 'Pago mínimo 3% del saldo insoluto.',
  },
  {
    label: 'Fase 2',
    validFrom: '2027-01-01',
    minPaymentFactor: 0.05,
    description: 'Pago mínimo sube a 5%.',
  },
  {
    label: 'Fase 3',
    validFrom: '2027-06-01',
    minPaymentFactor: 0.08,
    description: 'Pago mínimo sube a 8%.',
  },
  {
    label: 'Fase 4 — plena vigencia',
    validFrom: '2028-01-01',
    minPaymentFactor: 0.10,
    description: 'Norma CMF plena: 10% del saldo.',
  },
];

export function getActiveCmfPhase(date = new Date()): CmfPhase {
  const today = date.toISOString().split('T')[0];
  return [...CMF_PHASES]
    .reverse()
    .find(p => p.validFrom <= today) ?? CMF_PHASES[0];
}
