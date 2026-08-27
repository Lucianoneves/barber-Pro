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

    const slots = await new ListAvailableSlotsService().execute({
      user_id: shop.id,
      date,
    });

    return slots.map((slot) => slot.toISOString());
  }
}

export { ListPublicSlotsService };
