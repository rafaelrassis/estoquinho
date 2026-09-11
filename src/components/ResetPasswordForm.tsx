"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao redefinir senha");
      return;
    }
    router.push("/login");
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm text-center space-y-3">
        <p className="text-red-400 text-sm">Link inválido. Peça um novo link de redefinição.</p>
        <Link href="/forgot-password" className="text-emerald-400 underline underline-offset-2 text-sm">
          Pedir novo link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-semibold">Nova senha</h1>
        <p className="text-sm text-slate-400">Escolha uma senha nova pra sua conta</p>
      </div>

      <input
        type="password"
        required
        minLength={6}
        placeholder="Nova senha (mínimo 6 caracteres)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3 text-base"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 text-slate-950 font-medium py-3 disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
