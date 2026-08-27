import prismaClient from "../../prisma";

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
        name: true,
        slug: true,
        endereco: true,
        slot_interval_minutes: true,
        haircuts: {
          where: {
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
        },
        businessHours: {
          select: {
            weekday: true,
            closed: true,
            opens_at: true,
            closes_at: true,
          },
          orderBy: {
            weekday: "asc",
          },
        },
      },
    });

    if (!shop) {
      throw new Error("Barbearia não encontrada");
    }

    return shop;
  }
}

export { DetailPublicShopService };
