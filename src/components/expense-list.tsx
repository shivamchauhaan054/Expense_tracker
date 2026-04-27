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
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-100 text-slate-600">
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
              <tr key={expense.id} className="border-b last:border-0">
                <td className="px-4 py-3">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium">{expense.category}</td>
                <td className="px-4 py-3 text-slate-600">{expense.description ?? "-"}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ${(expense.amount / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => {
                      void deleteExpense(expense.id);
                    }}
                  >
                    Delete
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
            className="flex items-start justify-between rounded-xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold">{expense.category}</p>
              <p className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
              {expense.description ? (
                <p className="mt-1 text-sm text-slate-600">{expense.description}</p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="font-semibold">${(expense.amount / 100).toFixed(2)}</p>
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
    </div>
  );
}
