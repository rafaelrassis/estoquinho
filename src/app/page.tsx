import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

export default async function Home() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;
  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <div className="text-5xl">📦</div>
          <h1 className="text-3xl font-semibold">Estoquinho</h1>
          <p className="text-slate-400">
            Controle de estoque simples pra quem hoje usa planilha. Entrada, saída e alerta de
            estoque baixo, direto do celular.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-lg bg-emerald-500 text-slate-950 font-medium py-3"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="block w-full rounded-lg border border-slate-800 text-slate-200 py-3"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}
