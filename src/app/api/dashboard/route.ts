import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id")!;

  const [allActive, recentMovements] = await Promise.all([
    prisma.product.findMany({
      where: { userId, active: true },
      orderBy: { stockQty: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: { userId, type: "SAIDA" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { product: { select: { name: true, sku: true, photoUrl: true } } },
    }),
  ]);

  const lowStock = allActive.filter(
    (p: { stockQty: number; lowStockAt: number }) => p.stockQty <= p.lowStockAt
  );

  return NextResponse.json({ lowStock, recentMovements });
}
