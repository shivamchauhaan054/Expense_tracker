export type ExpenseFormValues = {
  amount: string;
  category: string;
  description: string;
  date: string;
};

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

export type ValidExpensePayload = {
  amountMinor: number;
  category: string;
  description?: string;
  dateIso: string;
};

export function validateExpenseForm(
  values: ExpenseFormValues,
  maxDateIso: string
): { isValid: boolean; errors: ExpenseFormErrors; payload?: ValidExpensePayload } {
  const errors: ExpenseFormErrors = {};

  const amountInput = values.amount.trim();
  const parsedAmount = Number(amountInput);
  if (!amountInput) {
    errors.amount = "Amount is required";
  } else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.amount = "Amount must be greater than zero";
  } else if (!/^\d+(\.\d{1,2})?$/.test(amountInput)) {
    errors.amount = "Amount can have at most 2 decimal places";
  }

  const category = values.category.trim();
  if (!category) {
    errors.category = "Category is required";
  } else if (category.length > 50) {
    errors.category = "Category must be 50 characters or less";
  }

  const description = values.description.trim();
  if (description.length > 500) {
    errors.description = "Description must be 500 characters or less";
  }

  if (!values.date) {
    errors.date = "Date is required";
  } else {
    const selected = new Date(values.date).getTime();
    const max = new Date(maxDateIso).getTime();
    if (selected > max) {
      errors.date = "Date cannot be in the future";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    payload: {
      amountMinor: Math.round(parsedAmount * 100),
      category,
      description: description || undefined,
      dateIso: new Date(`${values.date}T00:00:00.000Z`).toISOString()
    }
  };
}
