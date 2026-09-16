import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia",
});

// limite de produtos do plano pago (estrutura simples: 1 plano PRO só)
export const PRO_PRODUCT_LIMIT = 1000;
