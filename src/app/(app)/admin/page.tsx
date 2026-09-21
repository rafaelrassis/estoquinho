import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AdminPage() {
  const userId = await requireUserId();
  const me = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(me.email.toLowerCase())) notFound();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });

  const totalUsers = users.length;
  const totalProducts = users.reduce((sum: number, u: { _count: { products: number } }) => sum + u._count.products, 0);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Admin</h1>

      <div className="flex gap-3">
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-3">
          <p className="text-2xl font-semibold">{totalUsers}</p>
          <p className="text-xs text-slate-400">usuários</p>
        </div>
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-3">
          <p className="text-2xl font-semibold">{totalProducts}</p>
          <p className="text-xs text-slate-400">produtos (total)</p>
        </div>
      </div>

      <div className="space-y-2">
        {users.map((u: { id: string; name: string; email: string; plan: string; createdAt: Date; _count: { products: number } }) => (
          <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="font-medium truncate">{u.name}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  u.plan === "PRO" ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"
                }`}
              >
                {u.plan}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{u.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              {u._count.products} produto(s) · desde{" "}
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(u.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
