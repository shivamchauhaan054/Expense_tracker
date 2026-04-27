"use client";

import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { Expense } from "@/types/expense";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  const totalInMinorUnits = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = useMemo(
    () => Array.from(new Set(expenses.map((expense) => expense.category))).sort(),
    [expenses]
  );
  const visibleExpenses = useMemo(() => {
    const filtered =
      selectedCategory === "all"
        ? expenses
        : expenses.filter((expense) => expense.category === selectedCategory);

    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, selectedCategory]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <p className="text-slate-600">Track spending with a minimal full-stack architecture.</p>
      </header>

      <section className="mb-6">
        <div className="rounded-xl bg-slate-900 p-4 text-white shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-300">Total Spent</p>
          <p className="mt-1 text-3xl font-bold">${(totalInMinorUnits / 100).toFixed(2)}</p>
        </div>
      </section>

      <section className="mb-6">
        <ExpenseForm onCreated={loadExpenses} />
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">All Expenses</h2>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}
        {!loading && !error ? (
          <ExpenseList expenses={visibleExpenses} onDeleted={loadExpenses} />
        ) : null}
      </section>
    </main>
  );
}
