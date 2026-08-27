import prismaClient from "../../prisma";
import { ListAvailableSlotsService } from "../schedule/ListAvailableSlotsService";

interface ListPublicSlotsRequest {
  slug: string;
  date: string;
  ignore_schedule_id?: string;
}

class ListPublicSlotsService {
  async execute({ slug, date, ignore_schedule_id }: ListPublicSlotsRequest) {
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
      ignore_schedule_id,
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
