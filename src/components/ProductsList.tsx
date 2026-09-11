"use client";
import { useEffect, useRef, useState } from "react";
import { ProductRow } from "@/components/ProductRow";

type Product = {
  id: string;
  name: string;
  sku: string;
  stockQty: number;
  lowStockAt: number;
  photoUrl: string | null;
};

type Props = { initialProducts: Product[]; initialNextCursor: string | null };

export function ProductsList({ initialProducts, initialNextCursor }: Props) {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  // busca com debounce: toda mudança de termo reinicia a paginação
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const myId = ++requestId.current;
      setLoading(true);
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
      if (myId !== requestId.current) return; // resposta antiga, ignora
      const data = await res.json();
      setProducts(data.products);
      setNextCursor(data.nextCursor);
      setLoading(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&cursor=${nextCursor}`);
    const data = await res.json();
    setProducts((prev) => [...prev, ...data.products]);
    setNextCursor(data.nextCursor);
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome ou SKU..."
        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
      />

      {products.length === 0 && !loading && (
        <p className="text-sm text-slate-500">
          {q ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}
        </p>
      )}

      {products.map((p) => (
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

      {nextCursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full rounded-lg border border-slate-800 text-slate-300 py-3 disabled:opacity-50"
        >
          {loading ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
