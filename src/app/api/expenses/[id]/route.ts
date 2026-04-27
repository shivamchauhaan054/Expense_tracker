import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateExpenseSchema = z.object({
  amount: z.number().int().positive().max(999999999).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().max(500).optional(),
  date: z.string().datetime().optional()
});

type RouteContext = {
  params: { id: string };
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const data = updateExpenseSchema.parse(body);

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined
      }
    });

    return NextResponse.json(expense);
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

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    await prisma.expense.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Expense not found" }, { status: 404 });
  }
}
