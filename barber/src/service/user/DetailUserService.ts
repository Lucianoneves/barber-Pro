import prismaClient from "../../prisma";
import { syncUserSubscription } from "../../utils/manageSubscription";

class DetailUserService {
  async execute(user_id: string) {
    try {
      await syncUserSubscription(user_id);
    } catch (error) {
      console.log("Erro ao sincronizar assinatura: ", error);
    }

    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        endereco: true,
        slug: true,
        slot_interval_minutes: true,
        subscriptions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return user;
  }
}

export { DetailUserService };
