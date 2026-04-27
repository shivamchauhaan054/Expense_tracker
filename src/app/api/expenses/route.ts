import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createExpenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .int("Amount must be an integer in smallest currency unit")
    .positive("Amount must be greater than zero"),
  category: z.string().trim().min(1, "Category is required"),
  description: z.string().trim().optional(),
  date: z.string().datetime("Date must be a valid ISO datetime"),
  idempotencyKey: z.string().trim().min(1, "Idempotency key is required")
});

const getExpensesQuerySchema = z.object({
  category: z.string().trim().min(1).optional()
});

export async function GET(request: NextRequest) {
  try {
    const query = getExpensesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    const expenses = await prisma.expense.findMany({
      where: query.category ? { category: query.category } : undefined,
      orderBy: { date: "desc" }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid query parameters", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existingExpense = await prisma.expense.findUnique({
      where: { idempotencyKey: data.idempotencyKey }
    });
    if (existingExpense) {
      return NextResponse.json(existingExpense, { status: 200 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        date: new Date(data.date),
        idempotencyKey: data.idempotencyKey
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Duplicate submission detected for idempotency key" },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}
