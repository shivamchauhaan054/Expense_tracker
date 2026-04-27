export type Expense = {
  id: string;
  // Stored in smallest unit (e.g. cents/paise)
  amount: number;
  category: string;
  description: string | null;
  date: string;
  createdAt: string;
  idempotencyKey: string;
};

export type CreateExpenseInput = {
  amount: number;
  category: string;
  description?: string;
  date: string;
  idempotencyKey: string;
};
