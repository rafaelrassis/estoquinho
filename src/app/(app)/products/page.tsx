import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProductsList } from "@/components/ProductsList";

const PAGE_SIZE = 30;

export default async function ProductsPage() {
  const userId = await requireUserId();
  const products = await prisma.product.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
    take: PAGE_SIZE + 1,
  });

  const hasMore = products.length > PAGE_SIZE;
  const page = hasMore ? products.slice(0, PAGE_SIZE) : products;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Produtos</h1>
        <a
          href="/api/export/products"
          className="text-sm text-slate-400 underline underline-offset-2"
        >
          exportar CSV
        </a>
      </div>
      <ProductsList initialProducts={page} initialNextCursor={nextCursor} />
    </div>
  );
}
