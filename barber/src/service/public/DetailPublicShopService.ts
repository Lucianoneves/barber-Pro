import prismaClient from "../../prisma";
import { ensureBusinessHours } from "../../utils/ensureBusinessHours";

interface DetailPublicShopRequest {
  slug: string;
}

class DetailPublicShopService {
  async execute({ slug }: DetailPublicShopRequest) {
    const shop = await prismaClient.user.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        endereco: true,
        slot_interval_minutes: true,
      },
    });

    if (!shop) {
      throw new Error("Barbearia não encontrada");
    }

    await ensureBusinessHours(shop.id);

    let haircuts = await prismaClient.haircut.findMany({
      where: {
        user_id: shop.id,
        status: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    if (haircuts.length === 0) {
      haircuts = await prismaClient.haircut.findMany({
        where: {
          user_id: shop.id,
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    }

    const businessHours = await prismaClient.businessHour.findMany({
      where: {
        user_id: shop.id,
      },
      select: {
        weekday: true,
        closed: true,
        opens_at: true,
        closes_at: true,
      },
      orderBy: {
        weekday: "asc",
      },
    });

    return {
      name: shop.name,
      slug: shop.slug,
      endereco: shop.endereco,
      slot_interval_minutes: shop.slot_interval_minutes,
      haircuts,
      businessHours,
    };
  }
}

export { DetailPublicShopService };
