import prismaClient from "../../prisma";
import { ListAvailableSlotsService } from "../schedule/ListAvailableSlotsService";

interface ListPublicSlotsRequest {
  slug: string;
  date: string;
}

class ListPublicSlotsService {
  async execute({ slug, date }: ListPublicSlotsRequest) {
    const shop = await prismaClient.user.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!shop) {
      throw new Error("Barbearia não encontrada");
    }

    const day = await new ListAvailableSlotsService().executeDay({
      user_id: shop.id,
      date,
    });

    return {
      closed: day.closed,
      slots: day.slots.map((slot) => ({
        at: slot.at.toISOString(),
        status: slot.status,
      })),
    };
  }
}

export { ListPublicSlotsService };
