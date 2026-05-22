export interface FarmerTransactionItem {
  id: number;
  description: string | null;
  weight: number;
  price: number;
  imagePath: string | null;
  hasTare: boolean;
  netWeight: number;
  amount: number;
}

export interface FarmerPayment {
  id: number;
  farmerTransactionId: number;
  date: string;
  amount: number;
  notes: string | null;
}

export interface FarmerTransaction {
  id: number;
  date: string;
  farmerId: number;
  farmerName: string;
  farmerPhoneNumber: string | null;
  notes: string | null;

  items: FarmerTransactionItem[];
  payments: FarmerPayment[];

  totalWeight: number;
  totalNetWeight: number;
  totalAmount: number;
  totalPaid: number;
  remaining: number;
  isPaid: boolean;
  isClosed: boolean;
  closedAt: string | null;
}

export interface FarmerTransactionItemInput {
  id?: number | null;
  description: string | null;
  weight: number;
  price: number;
  hasTare: boolean;
}

export interface FarmerPaymentInput {
  date: string;
  amount: number;
  notes: string | null;
}

export interface CreateFarmerTransactionRequest {
  date: string;
  farmerId: number;
  notes?: string | null;
  items: FarmerTransactionItemInput[];
  payments?: FarmerPaymentInput[];
}

export interface UpdateFarmerTransactionRequest extends CreateFarmerTransactionRequest {
  id: number;
}

export interface AddPaymentRequest {
  date: string;
  amount: number;
  notes?: string | null;
}

export interface FarmerTransactionsSummary {
  total: number;
  paid: number;
  remaining: number;
  count: number;
  totalWeight: number;
  totalNetWeight: number;
}
