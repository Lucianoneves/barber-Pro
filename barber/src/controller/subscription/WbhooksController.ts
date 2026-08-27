import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../../utils/stripe";
import { saveSubscription } from "../../utils/manageSubscription";

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

class WebhooksController {
  async handle(request: Request, response: Response) {
    console.log("Webhook endpoint hit");

    const signature = request.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim().replace(
      /^"|"$/g,
      ""
    );

    if (!signature || !endpointSecret) {
      return response
        .status(400)
        .json({ error: "Webhook secret ou assinatura ausente" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (error) {
      return response.status(400).json({ error: "Webhook error" });
    }

    try {
      switch (event.type) {
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = stripeId(subscription.customer);

          if (customerId) {
            await saveSubscription(subscription.id, customerId, false, true);
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = stripeId(subscription.customer);

          if (customerId) {
            await saveSubscription(subscription.id, customerId, true, false);
          }
          break;
        }

        case "checkout.session.completed": {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          const subscriptionId = stripeId(checkoutSession.subscription);
          const customerId = stripeId(checkoutSession.customer);

          if (
            checkoutSession.mode === "subscription" &&
            subscriptionId &&
            customerId
          ) {
            await saveSubscription(subscriptionId, customerId, true, false);
          }
          break;
        }

        default:
          console.log(`Evento desconhecido ${event.type}`);
      }
    } catch (error) {
      console.log("Erro ao processar webhook: ", error);
      return response.status(500).json({ error: "Erro ao processar webhook" });
    }

    return response.status(200).json({ received: true });
  }
}

export { WebhooksController };
