import prismaClient from "../../prisma";
import {
  buildAvailableSlots,
  dayRange,
  isValidDateInput,
  weekdayFromDate,
} from "../../utils/scheduleSlots";

interface ListAvailableSlotsRequest {
  user_id: string;
  date: string;
}

class ListAvailableSlotsService {
  async execute({ user_id, date }: ListAvailableSlotsRequest) {
    if (!isValidDateInput(date)) {
      throw new Error("Data inválida");
    }

    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
      include: {
        businessHours: true,
      },
    });

    if (!user) {
      throw new Error("Barbearia não encontrada");
    }

    const hour = user.businessHours.find(
      (item) => item.weekday === weekdayFromDate(date)
    );

    if (!hour || hour.closed || !hour.opens_at || !hour.closes_at) {
      return [];
    }

    const { start, end } = dayRange(date);

    const occupied = await prismaClient.service.findMany({
      where: {
        user_id,
        scheduled_at: {
          gte: start,
          lte: end,
        },
      },
      select: {
        scheduled_at: true,
      },
    });

    return buildAvailableSlots({
      date,
      opens_at: hour.opens_at,
      closes_at: hour.closes_at,
      interval: user.slot_interval_minutes,
      occupied: occupied.map((item) => item.scheduled_at),
    });
  }
}

export { ListAvailableSlotsService };
