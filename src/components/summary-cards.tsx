type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </article>
  );
}

type CategoryTotal = {
  category: string;
  amountMinor: number;
};

type CategorySummaryCardsProps = {
  totals: CategoryTotal[];
};

export function CategorySummaryCards({ totals }: CategorySummaryCardsProps) {
  if (totals.length === 0) {
    return (
      <article className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
        Category totals will appear once expenses are added.
      </article>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {totals.map((item) => (
        <article
          key={item.category}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.category}</p>
          <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
            ₹{(item.amountMinor / 100).toFixed(2)}
          </p>
        </article>
      ))}
    </div>
  );
}
