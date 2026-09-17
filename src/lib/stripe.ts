import "server-only";
import Stripe from "stripe";

// toggle de modo teste: liga com STRIPE_TEST_MODE=true (independe do ambiente
// Vercel — dá pra testar em qualquer deploy sem gerar cobrança real)
export const isStripeTestMode = process.env.STRIPE_TEST_MODE === "true";

export const stripeSecretKey = isStripeTestMode
  ? process.env.STRIPE_SECRET_KEY_TEST
  : process.env.STRIPE_SECRET_KEY;

export const stripePriceId = isStripeTestMode
  ? process.env.STRIPE_PRICE_ID_TEST
  : process.env.STRIPE_PRICE_ID;

export const stripeWebhookSecret = isStripeTestMode
  ? process.env.STRIPE_WEBHOOK_SECRET_TEST
  : process.env.STRIPE_WEBHOOK_SECRET;

export const stripe = new Stripe(stripeSecretKey as string, {
  apiVersion: "2026-08-26.dahlia",
});

// limite de produtos do plano pago (estrutura simples: 1 plano PRO só)
export const PRO_PRODUCT_LIMIT = 1000;
