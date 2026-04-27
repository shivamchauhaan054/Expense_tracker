import { Expense } from "@/types/expense";

export function filterAndSortExpenses(expenses: Expense[], selectedCategory: string) {
  const filtered =
    selectedCategory === "all"
      ? expenses
      : expenses.filter((expense) => expense.category === selectedCategory);

  return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function calculateVisibleTotalMinor(expenses: Expense[]) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateCategoryTotals(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  return Array.from(totals.entries())
    .map(([category, amountMinor]) => ({ category, amountMinor }))
    .sort((a, b) => b.amountMinor - a.amountMinor);
}
