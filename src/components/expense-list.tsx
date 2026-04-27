import { Expense } from "@/types/expense";
import { requestJson } from "@/lib/http";
import { useState } from "react";

type Props = {
  expenses: Expense[];
  onDeleted: () => Promise<void>;
};

export function ExpenseList({ expenses, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedDeleteId, setLastFailedDeleteId] = useState<string | null>(null);

  async function deleteExpense(id: string) {
    if (deletingId === id) {
      return;
    }
    setDeletingId(id);
    setError(null);
    try {
      await requestJson<{ ok: boolean }>(`/api/expenses/${id}`, {
        method: "DELETE",
        retries: 2
      });
      setLastFailedDeleteId(null);
      await onDeleted();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete expense");
      setLastFailedDeleteId(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-base font-medium text-slate-700 dark:text-slate-200">No expenses found</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Try changing filters or add a new expense to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <p>{error}</p>
          {lastFailedDeleteId ? (
            <button
              className="mt-2 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
              onClick={() => {
                void deleteExpense(lastFailedDeleteId);
              }}
            >
              Retry delete
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0 dark:border-slate-800 dark:hover:bg-slate-800/50" key={expense.id}>
                <td className="px-4 py-3">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                  {expense.category}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{expense.description ?? "-"}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{(expense.amount / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={deletingId === expense.id}
                    onClick={() => {
                      void deleteExpense(expense.id);
                    }}
                  >
                    {deletingId === expense.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{expense.category}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
                {expense.description ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{expense.description}</p>
                ) : null}
              </div>
              <p className="text-right text-base font-semibold text-slate-900 dark:text-slate-100">
                ₹{(expense.amount / 100).toFixed(2)}
              </p>
            </div>
            <button
              className="mt-3 text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              disabled={deletingId === expense.id}
              onClick={() => {
                void deleteExpense(expense.id);
              }}
            >
              {deletingId === expense.id ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
