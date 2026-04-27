"use client";

import { ApiError, requestJson } from "@/lib/http";
import { ExpenseFormErrors, validateExpenseForm } from "@/lib/expense-validation";
import { CreateExpenseInput, Expense } from "@/types/expense";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  onCreated: () => Promise<void>;
};

const PENDING_SUBMISSION_STORAGE_KEY = "expense_tracker_pending_submission";

type PendingSubmission = {
  signature: string;
  idempotencyKey: string;
};

export function ExpenseForm({ onCreated }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ExpenseFormErrors>({});
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
  const pendingRequestSignatureRef = useRef<string | null>(null);
  const maxDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!success) {
      return;
    }
    const timer = window.setTimeout(() => setSuccess(null), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  function loadPendingSubmission() {
    if (typeof window === "undefined") {
      return null;
    }
    const raw = window.localStorage.getItem(PENDING_SUBMISSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as PendingSubmission;
    } catch {
      return null;
    }
  }

  function savePendingSubmission(value: PendingSubmission) {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(PENDING_SUBMISSION_STORAGE_KEY, JSON.stringify(value));
  }

  function clearPendingSubmission() {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.removeItem(PENDING_SUBMISSION_STORAGE_KEY);
  }

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
    setFieldErrors({});

    try {
      const validation = validateExpenseForm(
        {
          amount,
          category,
          description,
          date
        },
        maxDate
      );
      if (!validation.isValid || !validation.payload) {
        setFieldErrors(validation.errors);
        throw new Error("Please fix the highlighted fields.");
      }

      const payload: CreateExpenseInput = {
        amount: validation.payload.amountMinor,
        category: validation.payload.category,
        description: validation.payload.description,
        date: validation.payload.dateIso,
        idempotencyKey: ""
      };
      const requestSignature = JSON.stringify({
        amount: payload.amount,
        category: payload.category,
        description: payload.description ?? "",
        date: payload.date
      });
      const existingPending = loadPendingSubmission();
      payload.idempotencyKey =
        existingPending?.signature === requestSignature
          ? existingPending.idempotencyKey
          : generateIdempotencyKey();

      if (pendingRequestSignatureRef.current === requestSignature) {
        throw new Error("Same expense submission is already in progress");
      }
      pendingRequestSignatureRef.current = requestSignature;
      savePendingSubmission({
        signature: requestSignature,
        idempotencyKey: payload.idempotencyKey
      });

      await requestJson<Expense>("/api/expenses", {
        method: "POST",
        body: payload,
        retries: 2
      });

      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      setSuccess("Expense saved successfully.");
      setLastSubmittedAt(new Date().toLocaleTimeString());
      await onCreated();
      router.refresh();
      clearPendingSubmission();
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status >= 500) {
        setError("Server issue while saving expense. Please try again.");
      } else {
        setError(submitError instanceof Error ? submitError.message : "Unknown error");
      }
    } finally {
      pendingRequestSignatureRef.current = null;
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Expense</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Record a new transaction in your dashboard.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Amount (INR)</span>
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="e.g. 1250.00"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          {fieldErrors.amount ? (
            <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.amount}</span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Category</span>
          <input
            list="expense-categories"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Food, Transport, Utilities..."
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          />
          {fieldErrors.category ? (
            <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.category}</span>
          ) : null}
        </label>
      </div>

      <datalist id="expense-categories">
        <option value="Food" />
        <option value="Transport" />
        <option value="Groceries" />
        <option value="Utilities" />
        <option value="Entertainment" />
      </datalist>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Date</span>
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            type="date"
            value={date}
            max={maxDate}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          {fieldErrors.date ? (
            <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.date}</span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Description</span>
          <textarea
            className="min-h-24 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Optional note about this expense"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {fieldErrors.description ? (
            <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.description}</span>
          ) : null}
        </label>
      </div>

      {loading ? (
        <p className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
          Submitting expense... please wait.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
          {lastSubmittedAt ? <span className="ml-1 opacity-80">at {lastSubmittedAt}</span> : null}
        </p>
      ) : null}
      <button
        className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Saving Expense..." : "Save Expense"}
      </button>
    </form>
  );
}
