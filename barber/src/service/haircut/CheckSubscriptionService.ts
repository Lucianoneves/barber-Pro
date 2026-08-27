import prismaClient from "../../prisma";
import { syncUserSubscription } from "../../utils/manageSubscription";

interface CheckSubscription {
  user_id: string;
}

class CheckSubscriptionService {
  async execute({ user_id }: CheckSubscription) {
    try {
      await syncUserSubscription(user_id);
    } catch (error) {
      console.log("Erro ao sincronizar assinatura: ", error);
    }

    const status = await prismaClient.user.findFirst({
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

    return status;
  }
}

export { CheckSubscriptionService };
