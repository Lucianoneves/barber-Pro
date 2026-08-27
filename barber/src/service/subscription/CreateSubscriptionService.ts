import prismaClient from "../../prisma";
import { stripe } from "../../utils/stripe";

interface SubscriptionRequest {
  user_id: string;
}

class CreateSubscriptionService {
  async execute({ user_id }: SubscriptionRequest) {
    const findUser = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
    });

    if (!findUser) {
      throw new Error("Usuário não encontrado");
    }

    const stripePrice = process.env.STRIPE_PRICE?.trim().replace(/^"|"$/g, "");
    const successUrl = process.env.STRIPE_SUCCESS_URL?.trim().replace(
      /^"|"$/g,
      ""
    );
    const cancelUrl = process.env.STRIPE_CANCEL_URL?.trim().replace(
      /^"|"$/g,
      ""
    );

    if (!stripePrice || !successUrl || !cancelUrl) {
      throw new Error("Configuração do Stripe incompleta");
    }

    const priceId = await this.resolvePriceId(stripePrice);

    let customerId = findUser.stripe_customer_id;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: findUser.email,
        metadata: {
          user_id,
        },
      });

      await prismaClient.user.update({
        where: {
          id: user_id,
        },
        data: {
          stripe_customer_id: stripeCustomer.id,
        },
      });

      customerId = stripeCustomer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user_id,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        user_id,
      },
      subscription_data: {
        metadata: {
          user_id,
        },
      },
    });

    return {
      sessionId: stripeCheckoutSession.id,
      url: stripeCheckoutSession.url,
    };
  }

  private async resolvePriceId(stripePrice: string) {
    if (stripePrice.startsWith("price_")) {
      return stripePrice;
    }

    if (!stripePrice.startsWith("prod_")) {
      throw new Error("STRIPE_PRICE inválido. Use um Price ID (price_...)");
    }

    const prices = await stripe.prices.list({
      product: stripePrice,
      active: true,
      type: "recurring",
      limit: 1,
    });

    const priceId = prices.data[0]?.id;

    if (!priceId) {
      throw new Error(
        "Nenhum preço recorrente encontrado para este produto no Stripe"
      );
    }

    return priceId;
  }
}

export { CreateSubscriptionService };
