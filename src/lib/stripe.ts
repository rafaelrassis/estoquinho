import "server-only";
import Stripe from "stripe";

// STRIPE_TEST_MODE=true usa as vars _TEST (chave/preço/webhook de teste), sem precisar
// trocar STRIPE_SECRET_KEY/STRIPE_PRICE_ID/STRIPE_WEBHOOK_SECRET na mao toda hora.
// Ver docs/stripe-test-spec.md.
const TEST_MODE = process.env.STRIPE_TEST_MODE === "true";

export const STRIPE_SECRET_KEY = TEST_MODE
  ? process.env.STRIPE_SECRET_KEY_TEST
  : process.env.STRIPE_SECRET_KEY;

export const STRIPE_PRICE_ID = TEST_MODE
  ? process.env.STRIPE_PRICE_ID_TEST
  : process.env.STRIPE_PRICE_ID;

export const STRIPE_WEBHOOK_SECRET = TEST_MODE
  ? process.env.STRIPE_WEBHOOK_SECRET_TEST
  : process.env.STRIPE_WEBHOOK_SECRET;

export const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-08-26.dahlia",
});

// limite de produtos do plano pago (estrutura simples: 1 plano PRO só)
export const PRO_PRODUCT_LIMIT = 1000;
