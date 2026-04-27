import { Expense } from "@/types/expense";

type Props = {
  expenses: Expense[];
  onDeleted: () => Promise<void>;
};

export function ExpenseList({ expenses, onDeleted }: Props) {
  async function deleteExpense(id: string) {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Could not delete expense");
    }

    await onDeleted();
  }

  if (expenses.length === 0) {
    return <p className="rounded-xl bg-white p-4 text-slate-600 shadow-sm">No expenses yet.</p>;
  }

  return (
    <ul className="grid gap-3">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="flex items-start justify-between rounded-xl bg-white p-4 shadow-sm"
        >
          <div>
            <p className="font-semibold">{expense.title}</p>
            <p className="text-sm text-slate-500">
              {new Date(expense.spentAt).toLocaleString()} {expense.category ? `| ${expense.category}` : ""}
            </p>
            {expense.notes ? <p className="mt-1 text-sm text-slate-600">{expense.notes}</p> : null}
          </div>
          <div className="text-right">
            <p className="font-semibold">${expense.amount.toFixed(2)}</p>
            <button
              className="mt-2 text-sm text-red-600 hover:underline"
              onClick={() => {
                void deleteExpense(expense.id);
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
