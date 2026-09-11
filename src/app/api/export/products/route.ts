import { prisma } from "@/lib/prisma";

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id")!;

  const products = await prisma.product.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
  });

  const header = ["Nome", "SKU", "Custo (R$)", "Preço (R$)", "Estoque atual", "Alerta estoque baixo"];
  const rows = products.map((p: { name: string; sku: string; costCents: number; priceCents: number; stockQty: number; lowStockAt: number }) => [
    p.name,
    p.sku,
    (p.costCents / 100).toFixed(2).replace(".", ","),
    (p.priceCents / 100).toFixed(2).replace(".", ","),
    p.stockQty,
    p.lowStockAt,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(";")).join("\n");
  const bom = "﻿"; // Excel abre acentuação certo com BOM

  return new Response(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="estoquinho-produtos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
