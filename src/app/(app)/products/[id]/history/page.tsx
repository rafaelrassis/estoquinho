import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const LABELS: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
};

export default async function ProductHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const product = await prisma.product.findFirst({ where: { id, userId } });
  if (!product) notFound();

  const movements = await prisma.stockMovement.findMany({
    where: { productId: id, userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold">Histórico</h1>
        <Link href={`/products/${id}/edit`} className="text-sm text-slate-400 underline underline-offset-2">
          editar produto
        </Link>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        {product.name} — saldo atual: <span className="font-medium text-slate-200">{product.stockQty}</span>
      </p>

      {movements.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma movimentação registrada ainda.</p>
      ) : (
        <ul className="space-y-2">
          {movements.map((m: { id: string; type: string; quantity: number; note: string | null; createdAt: Date }) => {
            const signed =
              m.type === "SAIDA" ? -Math.abs(m.quantity) : m.type === "AJUSTE" ? m.quantity : Math.abs(m.quantity);
            const positive = signed > 0;
            return (
              <li
                key={m.id}
                className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm">{LABELS[m.type] ?? m.type}</p>
                  <p className="text-xs text-slate-500">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                      m.createdAt
                    )}
                    {m.note ? ` · ${m.note}` : ""}
                  </p>
                </div>
                <span className={`font-medium shrink-0 ${positive ? "text-emerald-400" : "text-amber-400"}`}>
                  {positive ? "+" : ""}
                  {signed}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
