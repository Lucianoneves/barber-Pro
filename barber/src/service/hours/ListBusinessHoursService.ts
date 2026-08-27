import prismaClient from "../../prisma";
import { getDefaultBusinessHours } from "../../utils/defaultBusinessHours";

interface ListBusinessHoursRequest {
  user_id: string;
}

class ListBusinessHoursService {
  async execute({ user_id }: ListBusinessHoursRequest) {
    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
      select: {
        slug: true,
        slot_interval_minutes: true,
        businessHours: {
          orderBy: {
            weekday: "asc",
          },
        },
      },
    });

    if (!user) {
      throw new Error("Usuario nao encontrado");
    }

    let hours = user.businessHours;

    if (hours.length === 0) {
      await prismaClient.businessHour.createMany({
        data: getDefaultBusinessHours().map((item) => ({
          ...item,
          user_id,
        })),
      });

      hours = await prismaClient.businessHour.findMany({
        where: {
          user_id,
        },
        orderBy: {
          weekday: "asc",
        },
      });
    }

    return {
      slug: user.slug,
      slot_interval_minutes: user.slot_interval_minutes,
      hours,
    };
  }
}

export { ListBusinessHoursService };
