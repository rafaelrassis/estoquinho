"use client";
import { useMemo, useState } from "react";
import { ProductRow } from "@/components/ProductRow";

type Product = {
  id: string;
  name: string;
  sku: string;
  stockQty: number;
  lowStockAt: number;
  photoUrl: string | null;
};

export function ProductsList({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
  }, [products, q]);

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome ou SKU..."
        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
      />

      {filtered.length === 0 && (
        <p className="text-sm text-slate-500">
          {products.length === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum produto encontrado."}
        </p>
      )}

      {filtered.map((p) => (
        <ProductRow
          key={p.id}
          id={p.id}
          name={p.name}
          sku={p.sku}
          stockQty={p.stockQty}
          lowStockAt={p.lowStockAt}
          photoUrl={p.photoUrl}
        />
      ))}
    </div>
  );
}
