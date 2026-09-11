import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products - lista produtos do dono logado
export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id")!;
  const products = await prisma.product.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

// POST /api/products - cria produto
export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")!;
  const body = await req.json();

  // limite de plano (estrutura pronta, regra real fica pra depois)
  const count = await prisma.product.count({ where: { userId, active: true } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && count >= user.planProductLimit) {
    return NextResponse.json(
      { error: `Limite de ${user.planProductLimit} produtos do plano atingido` },
      { status: 402 }
    );
  }

  const product = await prisma.product.create({
    data: {
      userId,
      name: body.name,
      sku: body.sku,
      costCents: body.costCents,
      priceCents: body.priceCents,
      photoUrl: body.photoUrl ?? null,
      lowStockAt: body.lowStockAt ?? 5,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
