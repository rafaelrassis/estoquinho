import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLowStockDigest } from "@/lib/email";

// Chamado 1x/dia pelo Vercel Cron (vercel.json). Vercel manda o CRON_SECRET
// automaticamente no header Authorization quando a variavel esta configurada.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  const users = await prisma.user.findMany({
    include: { products: { where: { active: true } } },
  });

  let sent = 0;
  for (const user of users) {
    const lowStock = user.products.filter((p: { stockQty: number; lowStockAt: number }) => p.stockQty <= p.lowStockAt);
    if (lowStock.length === 0) continue;

    await sendLowStockDigest(
      user.email,
      lowStock.map((p: { name: string; sku: string; stockQty: number; lowStockAt: number }) => ({
        name: p.name,
        sku: p.sku,
        stockQty: p.stockQty,
        lowStockAt: p.lowStockAt,
      })),
      appUrl
    );
    sent++;
  }

  return NextResponse.json({ ok: true, usersChecked: users.length, emailsSent: sent });
}
