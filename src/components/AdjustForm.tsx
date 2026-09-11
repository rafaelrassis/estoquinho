"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdjustForm({ productId, currentQty }: { productId: string; currentQty: number }) {
  const router = useRouter();
  const [newQty, setNewQty] = useState(String(currentQty));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const target = parseInt(newQty, 10);
    if (Number.isNaN(target) || target < 0) {
      setError("Informe uma quantidade válida");
      return;
    }
    const delta = target - currentQty;
    if (delta === 0) {
      router.push("/products");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, type: "AJUSTE", quantity: delta, note: note || undefined }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao ajustar");
      return;
    }
    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        inputMode="numeric"
        value={newQty}
        onChange={(e) => setNewQty(e.target.value)}
        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3 text-lg"
        placeholder="Nova quantidade em estoque"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Motivo (opcional): quebra, perda, contagem..."
        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 text-slate-950 font-medium py-3 disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Confirmar ajuste"}
      </button>
    </form>
  );
}
