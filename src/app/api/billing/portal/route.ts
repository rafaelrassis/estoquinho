import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")!;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "Nenhuma assinatura encontrada" }, { status: 404 });
  }

  const stripe = getStripe();
  const origin = new URL(req.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
