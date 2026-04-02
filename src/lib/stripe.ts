import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const STRIPE_PLANS = {
  starter: {
    name: "Starter",
    price: 3900, // cents
    description: "100 exportaciones/mes, búsqueda básica",
  },
  growth: {
    name: "Growth",
    price: 9900,
    description: "1.000 exportaciones/mes, búsqueda avanzada",
  },
  business: {
    name: "Business",
    price: 19900,
    description: "Exportaciones ilimitadas, API, alertas",
  },
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;
