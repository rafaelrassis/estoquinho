import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | undefined;

// lazy: evita quebrar o build/collect de rotas quando STRIPE_SECRET_KEY ainda não está configurado
export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2026-08-26.dahlia",
    });
  }
  return _stripe;
}

// limite de produtos do plano pago (estrutura simples: 1 plano PRO só)
export const PRO_PRODUCT_LIMIT = 1000;
