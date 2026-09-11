"use client";
import { useState } from "react";

export function BillingActions({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function go(path: string) {
    setError("");
    setLoading(true);
    const res = await fetch(path, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao abrir cobrança");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {isPro ? (
        <button
          onClick={() => go("/api/billing/portal")}
          disabled={loading}
          className="w-full rounded-lg border border-slate-800 text-slate-200 py-3 disabled:opacity-50"
        >
          {loading ? "Abrindo..." : "Gerenciar assinatura"}
        </button>
      ) : (
        <button
          onClick={() => go("/api/billing/checkout")}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 text-slate-950 font-medium py-3 disabled:opacity-50"
        >
          {loading ? "Abrindo..." : "Assinar PRO"}
        </button>
      )}
    </div>
  );
}
