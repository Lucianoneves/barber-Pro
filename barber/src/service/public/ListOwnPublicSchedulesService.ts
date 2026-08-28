import prismaClient from "../../prisma";

interface ListOwnPublicSchedulesRequest {
  customer_id: string;
  shop_id: string;
}

class ListOwnPublicSchedulesService {
  async execute({ customer_id, shop_id }: ListOwnPublicSchedulesRequest) {
    const schedules = await prismaClient.service.findMany({
      where: {
        customer_id,
        user_id: shop_id,
        scheduled_at: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        scheduled_at: true,
        haircut: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        scheduled_at: "asc",
      },
    });

    return schedules.map((item) => ({
      id: item.id,
      scheduled_at: item.scheduled_at.toISOString(),
      haircut: item.haircut,
    }));
  }
}

export { ListOwnPublicSchedulesService };
