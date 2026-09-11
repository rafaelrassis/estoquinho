import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = req.headers.get("x-user-id")!;
  const { id } = await params;
  const body = await req.json();

  const product = await prisma.product.updateMany({
    where: { id, userId },
    data: {
      name: body.name,
      sku: body.sku,
      costCents: body.costCents,
      priceCents: body.priceCents,
      photoUrl: body.photoUrl,
      lowStockAt: body.lowStockAt,
    },
  });

  if (product.count === 0) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = req.headers.get("x-user-id")!;
  const { id } = await params;

  await prisma.product.updateMany({ where: { id, userId }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
