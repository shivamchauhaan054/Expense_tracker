"use client";

import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { Expense } from "@/types/expense";
import { useCallback, useEffect, useState } from "react";

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/expenses");
      if (!response.ok) {
        throw new Error("Could not load expenses");
      }
      const data = (await response.json()) as Expense[];
      setExpenses(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <p className="text-slate-600">Track spending with a minimal full-stack architecture.</p>
      </header>

      <section className="mb-6">
        <div className="rounded-xl bg-slate-900 p-4 text-white shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-300">Total Spent</p>
          <p className="mt-1 text-3xl font-bold">${total.toFixed(2)}</p>
        </div>
      </section>

      <section className="mb-6">
        <ExpenseForm onCreated={loadExpenses} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Expenses</h2>
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}
        {!loading && !error ? <ExpenseList expenses={expenses} onDeleted={loadExpenses} /> : null}
      </section>
    </main>
  );
}
