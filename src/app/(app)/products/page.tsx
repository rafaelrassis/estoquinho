import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProductsList } from "@/components/ProductsList";

export default async function ProductsPage() {
  const userId = await requireUserId();
  const products = await prisma.product.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Produtos</h1>
      <ProductsList products={products} />
    </div>
  );
}
