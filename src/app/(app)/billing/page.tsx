import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BillingActions } from "@/components/BillingActions";

export default async function BillingPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const productCount = await prisma.product.count({ where: { userId, active: true } });

  const isPro = user.plan === "PRO";

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Plano</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
        <p className="text-lg font-medium">{isPro ? "PRO" : "Gratuito"}</p>
        <p className="text-sm text-slate-400">
          {productCount} / {user.planProductLimit} produtos usados
        </p>
        {user.subscriptionStatus && (
          <p className="text-xs text-slate-500">Status da assinatura: {user.subscriptionStatus}</p>
        )}
      </div>

      <BillingActions isPro={isPro} />
    </div>
  );
}
