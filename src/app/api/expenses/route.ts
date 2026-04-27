import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createExpenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .int("Amount must be an integer in smallest currency unit")
    .positive("Amount must be greater than zero")
    .max(999999999, "Amount is too large"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category must be 50 characters or less"),
  description: z.string().trim().max(500, "Description must be 500 characters or less").optional(),
  date: z
    .string()
    .datetime("Date must be a valid ISO datetime")
    .refine((value) => new Date(value).getTime() <= Date.now(), "Date cannot be in the future"),
  idempotencyKey: z.string().trim().min(1).optional()
});

const getExpensesQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  sort: z.enum(["date_desc"]).optional()
});

export async function GET(request: NextRequest) {
  try {
    const query = getExpensesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    const expenses = await prisma.expense.findMany({
      where: query.category ? { category: query.category } : undefined,
      orderBy: query.sort === "date_desc" || !query.sort ? { date: "desc" } : undefined
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

function buildIdempotencyKey(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function resolveIdempotencyKey(
  data: z.infer<typeof createExpenseSchema>,
  headerKey: string | null
) {
  if (data.idempotencyKey) {
    return buildIdempotencyKey(`manual:${data.idempotencyKey}`);
  }
  if (headerKey) {
    return buildIdempotencyKey(`header:${headerKey}`);
  }

  // Fallback keeps POST contract minimal while supporting retry dedupe for same payload.
  return buildIdempotencyKey(
    `payload:${data.amount}:${data.category}:${data.description ?? ""}:${data.date}`
  );
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
    const idempotencyKey = resolveIdempotencyKey(data, request.headers.get("Idempotency-Key"));
    const existingExpense = await prisma.expense.findUnique({
      where: { idempotencyKey }
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
        idempotencyKey
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
