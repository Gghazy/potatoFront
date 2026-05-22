export interface TraderTransactionItem {
  id: number;
  date: string;
  description: string | null;
  weight: number;
  price: number;
  imagePath: string | null;
  hasTare: boolean;
  hasCommission: boolean;
  commissionPerTon: number;
  netWeight: number;
  amount: number;
  commission: number;
}

export interface TraderPayment {
  id: number;
  traderTransactionId: number;
  date: string;
  amount: number;
  notes: string | null;
}

export interface TraderTransaction {
  id: number;
  traderId: number;
  traderName: string;
  traderPhoneNumber: string | null;
  notes: string | null;

  items: TraderTransactionItem[];
  payments: TraderPayment[];

  totalWeight: number;
  totalNetWeight: number;
  totalAmount: number;
  totalCommission: number;
  totalPaid: number;
  remaining: number;
  isPaid: boolean;
  isClosed: boolean;
  closedAt: string | null;

  latestItemDate: string | null;
  earliestItemDate: string | null;
}

export interface TraderTransactionItemInput {
  id?: number | null;
  date: string;
  description: string | null;
  weight: number;
  price: number;
  hasTare: boolean;
  hasCommission: boolean;
  commissionPerTon: number;
}

export interface CreateTraderTransactionRequest {
  traderId: number;
  notes?: string | null;
  items: TraderTransactionItemInput[];
}

export interface UpdateTraderTransactionRequest extends CreateTraderTransactionRequest {
  id: number;
}

export interface AddTraderPaymentRequest {
  date: string;
  amount: number;
  notes?: string | null;
}

export interface TraderTransactionsSummary {
  total: number;
  paid: number;
  remaining: number;
  totalCommission: number;
  count: number;
  totalWeight: number;
  totalNetWeight: number;
}
