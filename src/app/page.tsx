"use client";

import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { CategorySummaryCards, SummaryCard } from "@/components/summary-cards";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  calculateCategoryTotals,
  calculateVisibleTotalMinor,
  filterAndSortExpenses
} from "@/lib/expense-calculations";
import { requestJson } from "@/lib/http";
import { Expense } from "@/types/expense";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadExpenses = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    try {
      const data = await requestJson<Expense[]>("/api/expenses?sort=date_desc", {
        method: "GET",
        retries: 2
      });
      setExpenses(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? `${loadError.message}. Please retry in a few seconds.`
          : "Unknown error"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadExpenses(true);
  }, [loadExpenses]);

  const categories = useMemo(
    () => Array.from(new Set(expenses.map((expense) => expense.category))).sort(),
    [expenses]
  );
  const visibleExpenses = useMemo(
    () => filterAndSortExpenses(expenses, selectedCategory),
    [expenses, selectedCategory]
  );
  const visibleTotalInMinorUnits = useMemo(() => calculateVisibleTotalMinor(visibleExpenses), [visibleExpenses]);
  const categoryTotalsForVisibleExpenses = useMemo(
    () => calculateCategoryTotals(visibleExpenses),
    [visibleExpenses]
  );
  const recentExpenses = useMemo(() => visibleExpenses.slice(0, 5), [visibleExpenses]);
  const hasNoExpenses = !loading && !error && expenses.length === 0;
  const hasNoFilteredExpenses = !loading && !error && expenses.length > 0 && visibleExpenses.length === 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Personal Finance</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Expense Dashboard</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <section className="space-y-6 lg:col-span-4">
          <ExpenseForm onCreated={loadExpenses} />
          <SummaryCard
            label="Total Expenses"
            value={`₹${(visibleTotalInMinorUnits / 100).toFixed(2)}`}
            hint={`${visibleExpenses.length} entries in current view`}
          />
        </section>

        <section className="space-y-6 lg:col-span-8">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Expense Overview</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Filter by category and review latest expenses.
                </p>
              </div>
              <select
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
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

            {loading ? (
              <div className="space-y-3" aria-live="polite">
                <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : null}

            {!loading && refreshing ? (
              <p className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Refreshing latest data...
              </p>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
                <p className="font-medium text-red-700 dark:text-red-300">Unable to load expenses</p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                    onClick={() => {
                      void loadExpenses();
                    }}
                  >
                    Retry
                  </button>
                  <button
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/70"
                    onClick={() => {
                      setError(null);
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}

            {!loading && !error ? <ExpenseList expenses={visibleExpenses} onDeleted={loadExpenses} /> : null}
            {hasNoExpenses ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Start by adding your first expense from the form on the left.
              </p>
            ) : null}
            {hasNoFilteredExpenses ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No expenses match this category. Try selecting All categories.
              </p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Total by Category</h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Based on currently visible expenses
            </p>
            <CategorySummaryCards totals={categoryTotalsForVisibleExpenses} />
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Expenses</h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Latest 5 from current filtered list
            </p>
            <ExpenseList expenses={recentExpenses} onDeleted={loadExpenses} />
          </article>
        </section>
      </div>
    </main>
  );
}
