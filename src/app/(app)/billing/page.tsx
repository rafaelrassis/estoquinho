import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BillingActions } from "@/components/BillingActions";

export default async function BillingPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const productCount = await prisma.product.count({ where: { userId, active: true } });

  const isPro = user.plan === "PRO";
  const testMode = process.env.STRIPE_TEST_MODE === "true";
  const billingEnabled = process.env.BILLING_ENABLED === "true";

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Plano</h1>

      {billingEnabled && testMode && (
        <p className="text-xs bg-amber-950 border border-amber-900 text-amber-400 rounded-lg px-3 py-2">
          ⚠️ Cobrança em modo teste — nenhum cartão real é cobrado. Use 4242 4242 4242 4242.
        </p>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
        <p className="text-lg font-medium">{isPro ? "PRO" : "Gratuito"}</p>
        <p className="text-sm text-slate-400">
          {billingEnabled ? `${productCount} / ${user.planProductLimit} produtos usados` : `${productCount} produtos cadastrados`}
        </p>
        {billingEnabled && user.subscriptionStatus && (
          <p className="text-xs text-slate-500">Status da assinatura: {user.subscriptionStatus}</p>
        )}
      </div>

      {billingEnabled ? (
        <BillingActions isPro={isPro} />
      ) : (
        <p className="text-sm text-slate-500 text-center">
          Uso livre por enquanto — sem limite de produtos.
        </p>
      )}
    </div>
  );
}
