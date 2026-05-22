export interface RefrigeratorItem {
  id: number;
  refrigeratorId: number;
  date: string;
  sackCount: number;
  weight: number;
  description: string | null;
}

export interface RefrigeratorExpense {
  id: number;
  refrigeratorId: number;
  date: string;
  amount: number;
  description: string;
  notes: string | null;
}

export interface Refrigerator {
  id: number;
  name: string;
  notes: string | null;
  createdAt: string;
  items: RefrigeratorItem[];
  expenses: RefrigeratorExpense[];
  totalSackCount: number;
  totalWeight: number;
  totalExpenses: number;
}

export interface CreateRefrigeratorRequest {
  name: string;
  notes: string | null;
}

export interface UpdateRefrigeratorRequest extends CreateRefrigeratorRequest {
  id: number;
}

export interface RefrigeratorItemInput {
  date: string;
  sackCount: number;
  weight: number;
  description: string | null;
}

export interface RefrigeratorExpenseInput {
  date: string;
  amount: number;
  description: string;
  notes: string | null;
}

export interface RefrigeratorsSummary {
  count: number;
  totalSackCount: number;
  totalWeight: number;
  totalExpenses: number;
}
