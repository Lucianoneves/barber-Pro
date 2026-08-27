import { stripe } from "../../utils/stripe";
import {
  saveSubscription,
  syncUserSubscription,
} from "../../utils/manageSubscription";
import prismaClient from "../../prisma";

interface ConfirmSubscriptionRequest {
  user_id: string;
  session_id?: string;
}

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

class ConfirmSubscriptionService {
  async execute({ user_id, session_id }: ConfirmSubscriptionRequest) {
    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const subscriptionId = stripeId(session.subscription);
      const customerId = stripeId(session.customer);

      if (
        session.client_reference_id &&
        session.client_reference_id !== user_id
      ) {
        throw new Error("Sessão de pagamento não pertence a este usuário");
      }

      if (session.mode === "subscription" && subscriptionId && customerId) {
        await saveSubscription(subscriptionId, customerId, true, false);
      }
    } else {
      await syncUserSubscription(user_id);
    }

    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
      select: {
        subscriptions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return user?.subscriptions ?? null;
  }
}

export { ConfirmSubscriptionService };
