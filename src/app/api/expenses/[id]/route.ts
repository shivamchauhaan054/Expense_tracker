import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateExpenseSchema = z.object({
  title: z.string().trim().min(1).optional(),
  amount: z.number().positive().optional(),
  category: z.string().trim().optional(),
  spentAt: z.string().datetime().optional(),
  notes: z.string().trim().optional()
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
        title: data.title,
        amount: data.amount,
        category: data.category,
        spentAt: data.spentAt ? new Date(data.spentAt) : undefined,
        notes: data.notes
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
