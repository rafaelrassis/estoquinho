"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  sku: string;
  stockQty: number;
  lowStockAt: number;
  photoUrl?: string | null;
};

export function ProductRow({ id, name, sku, stockQty, lowStockAt, photoUrl }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(stockQty);
  const [busy, setBusy] = useState(false);
  const low = qty <= lowStockAt;

  async function move(type: "ENTRADA" | "SAIDA") {
    if (busy) return;
    setBusy(true);
    const prev = qty;
    setQty((q) => (type === "ENTRADA" ? q + 1 : Math.max(0, q - 1))); // otimista

    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, type, quantity: 1 }),
    });

    if (!res.ok) {
      setQty(prev); // desfaz se falhar (ex: estoque insuficiente)
    } else {
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-3 py-3 bg-slate-900 ${
        low ? "border-amber-900/50" : "border-slate-800"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-lg bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">📦</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{name}</p>
          <Link href={`/products/${id}/adjust`} className="text-xs text-slate-500 underline underline-offset-2">
            {sku} · ajustar
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => move("SAIDA")}
          disabled={busy || qty === 0}
          aria-label="Registrar saída"
          className="w-10 h-10 rounded-full bg-slate-800 text-lg disabled:opacity-30 active:scale-95"
        >
          –
        </button>
        <span className={`w-8 text-center font-semibold ${low ? "text-amber-400" : ""}`}>{qty}</span>
        <button
          onClick={() => move("ENTRADA")}
          disabled={busy}
          aria-label="Registrar entrada"
          className="w-10 h-10 rounded-full bg-emerald-600 text-slate-950 text-lg disabled:opacity-30 active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}
