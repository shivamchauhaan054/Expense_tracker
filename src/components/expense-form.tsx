"use client";

import { useState } from "react";

type Props = {
  onCreated: () => Promise<void>;
};

export function ExpenseForm({ onCreated }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function generateIdempotencyKey() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Amount must be greater than zero");
      }
      if (!date) {
        throw new Error("Date is required");
      }

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(parsedAmount * 100),
          category: category.trim(),
          description: description.trim() || undefined,
          date: new Date(`${date}T00:00:00.000Z`).toISOString(),
          idempotencyKey: generateIdempotencyKey()
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Could not create expense");
      }

      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      setSuccess("Expense saved successfully.");
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
        placeholder="Amount"
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        required
      />
      <input
        list="expense-categories"
        className="rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        required
      />
      <datalist id="expense-categories">
        <option value="Food" />
        <option value="Transport" />
        <option value="Groceries" />
        <option value="Utilities" />
        <option value="Entertainment" />
      </datalist>
      <input
        className="rounded-lg border border-slate-200 px-3 py-2"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        required
      />
      <textarea
        className="rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      <button
        className="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Expense"}
      </button>
    </form>
  );
}
