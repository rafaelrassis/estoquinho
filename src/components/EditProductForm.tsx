"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoPicker } from "@/components/PhotoPicker";

type Props = {
  id: string;
  name: string;
  sku: string;
  costCents: number;
  priceCents: number;
  lowStockAt: number;
  photoUrl: string | null;
};

export function EditProductForm(p: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: p.name,
    sku: p.sku,
    cost: (p.costCents / 100).toFixed(2),
    price: (p.priceCents / 100).toFixed(2),
    lowStockAt: String(p.lowStockAt),
  });
  const [photo, setPhoto] = useState<string | null>(p.photoUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        sku: form.sku,
        costCents: Math.round(parseFloat(form.cost.replace(",", ".") || "0") * 100),
        priceCents: Math.round(parseFloat(form.price.replace(",", ".") || "0") * 100),
        lowStockAt: parseInt(form.lowStockAt || "5", 10),
        photoUrl: photo,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao salvar produto");
      return;
    }
    router.push("/products");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Remover este produto? Ele deixa de aparecer na lista, mas o histórico é mantido.")) return;
    setLoading(true);
    await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <PhotoPicker value={photo} onChange={setPhoto} />

      <input
        required
        placeholder="Nome"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
      />
      <input
        required
        placeholder="SKU"
        value={form.sku}
        onChange={(e) => set("sku", e.target.value)}
        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
      />
      <div className="flex gap-3">
        <input
          required
          inputMode="decimal"
          placeholder="Custo (R$)"
          value={form.cost}
          onChange={(e) => set("cost", e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
        />
        <input
          required
          inputMode="decimal"
          placeholder="Preço (R$)"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
        />
      </div>
      <input
        inputMode="numeric"
        placeholder="Alerta de estoque baixo"
        value={form.lowStockAt}
        onChange={(e) => set("lowStockAt", e.target.value)}
        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 text-slate-950 font-medium py-3 disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar alterações"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="w-full rounded-lg border border-red-900/50 text-red-400 py-3 disabled:opacity-50"
      >
        Remover produto
      </button>
    </form>
  );
}
