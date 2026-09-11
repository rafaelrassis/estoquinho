import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditProductForm } from "@/components/EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const product = await prisma.product.findFirst({ where: { id, userId } });
  if (!product) notFound();

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Editar produto</h1>
      <EditProductForm
        id={product.id}
        name={product.name}
        sku={product.sku}
        costCents={product.costCents}
        priceCents={product.priceCents}
        lowStockAt={product.lowStockAt}
        photoUrl={product.photoUrl}
      />
    </div>
  );
}
