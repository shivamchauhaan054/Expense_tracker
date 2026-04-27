import { describe, expect, it } from "vitest";
import {
  calculateCategoryTotals,
  calculateVisibleTotalMinor,
  filterAndSortExpenses
} from "@/lib/expense-calculations";
import { Expense } from "@/types/expense";

const baseExpenses: Expense[] = [
  {
    id: "1",
    amount: 10000,
    category: "Food",
    description: "Lunch",
    date: "2026-04-10T00:00:00.000Z",
    createdAt: "2026-04-10T00:00:00.000Z",
    idempotencyKey: "k1"
  },
  {
    id: "2",
    amount: 25000,
    category: "Travel",
    description: "Taxi",
    date: "2026-04-14T00:00:00.000Z",
    createdAt: "2026-04-14T00:00:00.000Z",
    idempotencyKey: "k2"
  },
  {
    id: "3",
    amount: 5000,
    category: "Food",
    description: "Snacks",
    date: "2026-04-12T00:00:00.000Z",
    createdAt: "2026-04-12T00:00:00.000Z",
    idempotencyKey: "k3"
  }
];

describe("expense calculations", () => {
  it("filters by category and sorts by newest date first", () => {
    const visible = filterAndSortExpenses(baseExpenses, "Food");

    expect(visible).toHaveLength(2);
    expect(visible[0].id).toBe("3");
    expect(visible[1].id).toBe("1");
  });

  it("calculates total from visible expenses", () => {
    const visible = filterAndSortExpenses(baseExpenses, "Food");
    const total = calculateVisibleTotalMinor(visible);

    expect(total).toBe(15000);
  });

  it("calculates totals per category for summary cards", () => {
    const totals = calculateCategoryTotals(baseExpenses);

    expect(totals).toEqual([
      { category: "Travel", amountMinor: 25000 },
      { category: "Food", amountMinor: 15000 }
    ]);
  });
});
