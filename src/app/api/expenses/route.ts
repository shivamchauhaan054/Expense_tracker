import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  category: z.string().trim().optional(),
  spentAt: z.string().datetime(),
  notes: z.string().trim().optional()
});

export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: { spentAt: "desc" }
  });

  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createExpenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category || null,
        spentAt: new Date(data.spentAt),
        notes: data.notes || null
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}
