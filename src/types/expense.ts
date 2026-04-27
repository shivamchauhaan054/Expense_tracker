export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  spentAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpenseInput = {
  title: string;
  amount: number;
  category?: string;
  spentAt: string;
  notes?: string;
};
