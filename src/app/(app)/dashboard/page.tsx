import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const userId = await requireUserId();

  const [products, recentSales] = await Promise.all([
    prisma.product.findMany({ where: { userId, active: true } }),
    prisma.stockMovement.findMany({
      where: { userId, type: "SAIDA" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { product: { select: { name: true } } },
    }),
  ]);

  const lowStock = products.filter((p: { stockQty: number; lowStockAt: number }) => p.stockQty <= p.lowStockAt);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Painel</h1>
        <LogoutButton />
      </div>

      <section>
        <h2 className="text-sm font-medium text-slate-400 mb-2">
          Estoque baixo {lowStock.length > 0 && `(${lowStock.length})`}
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-sm text-slate-500">Tudo certo por aqui 👍</p>
        ) : (
          <ul className="space-y-2">
            {lowStock.map((p: { id: string; name: string; stockQty: number }) => (
              <li
                key={p.id}
                className="flex justify-between items-center bg-slate-900 border border-amber-900/50 rounded-lg px-4 py-3"
              >
                <span>{p.name}</span>
                <span className="text-amber-400 font-medium">{p.stockQty} un.</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-slate-400 mb-2">Vendidos recentemente</h2>
        {recentSales.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma venda registrada ainda</p>
        ) : (
          <ul className="space-y-2">
            {recentSales.map((m: { id: string; quantity: number; product: { name: string } }) => (
              <li
                key={m.id}
                className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-lg px-4 py-3"
              >
                <span>{m.product.name}</span>
                <span className="text-slate-400 text-sm">-{m.quantity} un.</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
