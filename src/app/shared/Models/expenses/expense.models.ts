export interface Expense {
  id: number;
  date: string;
  amount: number;
  description: string;
}

export interface CreateExpenseRequest {
  date: string;
  amount: number;
  description: string;
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  id: number;
}

export interface ExpensesSummary {
  total: number;
  count: number;
}
