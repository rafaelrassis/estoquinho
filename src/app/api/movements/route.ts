import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/movements - registra entrada/saida/ajuste e atualiza saldo atômico
export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")!;
  const body = await req.json(); // { productId, type: 'ENTRADA'|'SAIDA'|'AJUSTE', quantity, note? }

  const { productId, type, quantity, note } = body;

  if (!productId || !type || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const delta =
    type === "ENTRADA" ? quantity : type === "SAIDA" ? -quantity : quantity; // AJUSTE: quantidade já vem com sinal aplicado pelo cliente

  try {
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      const product = await tx.product.findFirst({ where: { id: productId, userId } });
      if (!product) throw new Error("NOT_FOUND");

      const newQty = product.stockQty + delta;
      if (newQty < 0) throw new Error("NEGATIVE_STOCK");

      const updated = await tx.product.update({
        where: { id: productId },
        data: { stockQty: newQty },
      });

      const movement = await tx.stockMovement.create({
        data: { productId, userId, type, quantity: Math.abs(quantity), note },
      });

      return { updated, movement };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ERRO";
    if (msg === "NOT_FOUND") return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    if (msg === "NEGATIVE_STOCK") return NextResponse.json({ error: "Estoque insuficiente" }, { status: 409 });
    return NextResponse.json({ error: "Erro ao registrar movimentação" }, { status: 500 });
  }
}

// GET /api/movements?productId= - histórico (usado no dashboard "vendidos recentemente")
export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id")!;
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const movements = await prisma.stockMovement.findMany({
    where: { userId, ...(productId ? { productId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { product: { select: { name: true, sku: true } } },
  });
  return NextResponse.json(movements);
}
