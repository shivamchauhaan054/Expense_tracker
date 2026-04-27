"use client";

import { useState } from "react";

type Props = {
  onCreated: () => Promise<void>;
};

export function ExpenseForm({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [spentAt, setSpentAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category: category || undefined,
          spentAt: new Date(spentAt).toISOString(),
          notes: notes || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Could not create expense");
      }

      setTitle("");
      setAmount("");
      setCategory("");
      setNotes("");
      await onCreated();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Add Expense</h2>
      <input
        className="rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      <input
        className="rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Amount"
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        required
      />
      <input
        className="rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Category (optional)"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      />
      <input
        className="rounded-lg border border-slate-200 px-3 py-2"
        type="datetime-local"
        value={spentAt}
        onChange={(event) => setSpentAt(event.target.value)}
        required
      />
      <textarea
        className="rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Expense"}
      </button>
    </form>
  );
}
