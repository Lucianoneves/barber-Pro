import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_API_KEY;

if (!stripeSecret) {
  throw new Error("STRIPE_API_KEY is not set");
}

export const stripe: Stripe = new Stripe(stripeSecret, {
  apiVersion: "2026-07-29.dahlia",
  appInfo: {
    name: "Barberpro",
    version: "1.0.0",
  },
});
