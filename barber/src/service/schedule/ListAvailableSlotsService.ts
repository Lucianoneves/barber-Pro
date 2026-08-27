import prismaClient from "../../prisma";
import {
  buildDaySlots,
  dayRange,
  isValidDateInput,
  weekdayFromDate,
} from "../../utils/scheduleSlots";

interface ListAvailableSlotsRequest {
  user_id: string;
  date: string;
  ignore_schedule_id?: string;
}

class ListAvailableSlotsService {
  async execute({ user_id, date }: ListAvailableSlotsRequest) {
    const day = await this.executeDay({ user_id, date });

    if (day.closed) {
      return [];
    }

    return day.slots
      .filter((slot) => slot.status === "available")
      .map((slot) => slot.at);
  }

  async executeDay({
    user_id,
    date,
    ignore_schedule_id,
  }: ListAvailableSlotsRequest) {
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
      return {
        closed: true,
        slots: [],
      };
    }

    const { start, end } = dayRange(date);

    const occupied = await prismaClient.service.findMany({
      where: {
        user_id,
        scheduled_at: {
          gte: start,
          lte: end,
        },
        ...(ignore_schedule_id
          ? {
              id: {
                not: ignore_schedule_id,
              },
            }
          : {}),
      },
      select: {
        scheduled_at: true,
      },
    });

    return {
      closed: false,
      slots: buildDaySlots({
        date,
        opens_at: hour.opens_at,
        closes_at: hour.closes_at,
        interval: user.slot_interval_minutes,
        occupied: occupied.map((item) => item.scheduled_at),
      }),
    };
  }
}

export { ListAvailableSlotsService };
