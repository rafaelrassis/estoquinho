"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    setMessage(body.message ?? "Se existir uma conta com esse e-mail, enviamos um link de redefinição.");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-semibold">Esqueci minha senha</h1>
          <p className="text-sm text-slate-400">Vamos te mandar um link de redefinição</p>
        </div>

        {message ? (
          <p className="text-sm text-emerald-400 text-center">{message}</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3 text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 text-slate-950 font-medium py-3 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-400">
          <Link href="/login" className="text-emerald-400 underline underline-offset-2">
            Voltar pro login
          </Link>
        </p>
      </div>
    </main>
  );
}
