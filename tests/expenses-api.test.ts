import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    expense: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    }
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

import { GET, POST } from "@/app/api/expenses/route";

describe("POST /api/expenses", () => {
  beforeEach(() => {
    prismaMock.expense.findUnique.mockReset();
    prismaMock.expense.create.mockReset();
    prismaMock.expense.findMany.mockReset();
  });

  it("creates a new expense when idempotency key is new", async () => {
    prismaMock.expense.findUnique.mockResolvedValue(null);
    prismaMock.expense.create.mockResolvedValue({
      id: "exp_1",
      amount: 4999,
      category: "Food",
      description: "Dinner",
      date: "2026-04-27T00:00:00.000Z",
      createdAt: "2026-04-27T00:00:00.000Z",
      idempotencyKey: "idem_1"
    });

    const request = new Request("http://localhost/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 4999,
        category: "Food",
        description: "Dinner",
        date: "2026-04-27T00:00:00.000Z",
        idempotencyKey: "idem_1"
      })
    });

    const response = await POST(request as never);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(prismaMock.expense.findUnique).toHaveBeenCalledWith({
      where: { idempotencyKey: expect.any(String) }
    });
    expect(prismaMock.expense.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.expense.create.mock.calls[0][0].data.idempotencyKey).toHaveLength(64);
    expect(json.id).toBe("exp_1");
  });

  it("prevents duplicate create on same idempotency key", async () => {
    prismaMock.expense.findUnique.mockResolvedValue({
      id: "exp_existing",
      amount: 1200,
      category: "Travel",
      description: "Bus",
      date: "2026-04-20T00:00:00.000Z",
      createdAt: "2026-04-20T00:00:00.000Z",
      idempotencyKey: "idem_dup"
    });

    const request = new Request("http://localhost/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1200,
        category: "Travel",
        description: "Bus",
        date: "2026-04-20T00:00:00.000Z",
        idempotencyKey: "idem_dup"
      })
    });

    const response = await POST(request as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.expense.create).not.toHaveBeenCalled();
    expect(json.id).toBe("exp_existing");
  });

  it("supports GET filtering and sort=date_desc query contract", async () => {
    prismaMock.expense.findMany.mockResolvedValue([]);
    const request = new NextRequest(
      "http://localhost/api/expenses?category=Food&sort=date_desc"
    );

    const response = await GET(request as never);

    expect(response.status).toBe(200);
    expect(prismaMock.expense.findMany).toHaveBeenCalledWith({
      where: { category: "Food" },
      orderBy: { date: "desc" }
    });
  });
});
