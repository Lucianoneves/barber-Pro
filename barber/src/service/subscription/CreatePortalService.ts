import prismaClient from "../../prisma";
import { stripe } from "../../utils/stripe";

interface CreatePortalRequest {
  userId: string;
}

class CreatePortalService {
  async execute({ userId }: CreatePortalRequest) {
    const findUser = await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      throw new Error("Usuário não encontrado");
    }

    const customerId = findUser.stripe_customer_id;

    if (!customerId) {
      throw new Error("Cliente Stripe não encontrado");
    }

    const returnUrl = process.env.STRIPE_SUCCESS_URL?.trim().replace(
      /^"|"$/g,
      ""
    );

    if (!returnUrl) {
      throw new Error("URL de retorno do Stripe não configurada");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: portalSession.url };
  }
}

export { CreatePortalService };
