import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProductRow } from "@/components/ProductRow";

export default async function ProductsPage() {
  const userId = await requireUserId();
  const products = await prisma.product.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold mb-2">Produtos</h1>
      {products.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum produto cadastrado ainda.</p>
      )}
      {products.map((p: { id: string; name: string; sku: string; stockQty: number; lowStockAt: number }) => (
        <ProductRow
          key={p.id}
          id={p.id}
          name={p.name}
          sku={p.sku}
          stockQty={p.stockQty}
          lowStockAt={p.lowStockAt}
        />
      ))}
    </div>
  );
}
