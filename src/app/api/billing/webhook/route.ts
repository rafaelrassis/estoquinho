import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, PRO_PRODUCT_LIMIT } from "@/lib/stripe";
import type Stripe from "stripe";

// Rota publica (fora do middleware de auth) - a seguranca vem da assinatura do Stripe, nao de cookie/sessao
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 501 });
  }

  const body = await req.text(); // precisa do corpo cru pra validar a assinatura
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature!, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "PRO", subscriptionStatus: "active", planProductLimit: PRO_PRODUCT_LIMIT },
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
      if (user) {
        const active = subscription.status === "active" || subscription.status === "trialing";
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: subscription.status,
            plan: active ? "PRO" : "FREE",
            planProductLimit: active ? PRO_PRODUCT_LIMIT : 30,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
