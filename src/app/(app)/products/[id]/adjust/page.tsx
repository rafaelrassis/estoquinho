import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdjustForm } from "@/components/AdjustForm";

export default async function AdjustPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const product = await prisma.product.findFirst({ where: { id, userId } });
  if (!product) notFound();

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-1">Ajustar estoque</h1>
      <p className="text-sm text-slate-400 mb-4">{product.name} — saldo atual: {product.stockQty}</p>
      <AdjustForm productId={product.id} currentQty={product.stockQty} />
    </div>
  );
}
