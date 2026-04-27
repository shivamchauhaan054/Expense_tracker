import { describe, expect, it } from "vitest";
import { validateExpenseForm } from "@/lib/expense-validation";

const maxDate = "2026-04-30";

describe("expense form validation", () => {
  it("rejects negative amount and missing date", () => {
    const result = validateExpenseForm(
      {
        amount: "-10",
        category: "Food",
        description: "",
        date: ""
      },
      maxDate
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBe("Amount must be greater than zero");
    expect(result.errors.date).toBe("Date is required");
  });

  it("returns normalized payload for valid input", () => {
    const result = validateExpenseForm(
      {
        amount: "120.50",
        category: "  Groceries  ",
        description: "  Weekly shopping  ",
        date: "2026-04-20"
      },
      maxDate
    );

    expect(result.isValid).toBe(true);
    expect(result.payload).toMatchObject({
      amountMinor: 12050,
      category: "Groceries",
      description: "Weekly shopping"
    });
  });
});
