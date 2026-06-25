export type CreditorId = 'falabella' | 'ripley' | 'cajaAndes' | 'bancoEstado';

export interface Creditor {
  id: CreditorId;
  name: string;
  cae: number;
  color: string;
  iconName: string;
}

export interface DebtEntry {
  creditorId: CreditorId;
  totalAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  monthlyPayment: number;
}

export interface BudgetMonth {
  month: number;
  year: number;
  salary: number;
  extras: number;
  creditorPayments: Record<CreditorId, number>;
  debts: DebtEntry[];
}
