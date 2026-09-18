import "server-only";
import Stripe from "stripe";

const isTestMode = process.env.STRIPE_TEST_MODE === "true";

export const stripe = new Stripe(
  (isTestMode ? process.env.STRIPE_SECRET_KEY_TEST : process.env.STRIPE_SECRET_KEY) as string,
  { apiVersion: "2026-08-26.dahlia" }
);

export const stripePriceId = isTestMode
  ? process.env.STRIPE_PRICE_ID_TEST
  : process.env.STRIPE_PRICE_ID;

export const stripeWebhookSecret = isTestMode
  ? process.env.STRIPE_WEBHOOK_SECRET_TEST
  : process.env.STRIPE_WEBHOOK_SECRET;

// limite de produtos do plano pago (estrutura simples: 1 plano PRO só)
export const PRO_PRODUCT_LIMIT = 1000;
