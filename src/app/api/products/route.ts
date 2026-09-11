import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 30;

// GET /api/products?q=&cursor= - lista paginada, com busca por nome/SKU
export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id")!;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const cursor = searchParams.get("cursor") || undefined;

  const products = await prisma.product.findMany({
    where: {
      userId,
      active: true,
      ...(q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { name: "asc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = products.length > PAGE_SIZE;
  const page = hasMore ? products.slice(0, PAGE_SIZE) : products;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return NextResponse.json({ products: page, nextCursor });
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
