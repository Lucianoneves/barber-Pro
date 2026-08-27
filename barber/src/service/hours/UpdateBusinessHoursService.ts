import prismaClient from "../../prisma";
import {
  ALLOWED_INTERVALS,
  isValidHourInput,
} from "../../utils/scheduleSlots";

interface HourInput {
  weekday: number;
  closed: boolean;
  opens_at?: string | null;
  closes_at?: string | null;
}

interface UpdateBusinessHoursRequest {
  user_id: string;
  slot_interval_minutes: number;
  hours: HourInput[];
}

class UpdateBusinessHoursService {
  async execute({
    user_id,
    slot_interval_minutes,
    hours,
  }: UpdateBusinessHoursRequest) {
    if (!ALLOWED_INTERVALS.includes(Number(slot_interval_minutes))) {
      throw new Error("Intervalo de horário inválido");
    }

    if (!Array.isArray(hours) || hours.length !== 7) {
      throw new Error("Informe o funcionamento dos 7 dias da semana");
    }

    const weekdays = hours.map((item) => Number(item.weekday)).sort();
    const expected = [0, 1, 2, 3, 4, 5, 6];

    if (weekdays.join(",") !== expected.join(",")) {
      throw new Error("Informe todos os dias da semana");
    }

    for (const hour of hours) {
      if (hour.closed) {
        continue;
      }

      if (!isValidHourInput(hour.opens_at) || !isValidHourInput(hour.closes_at)) {
        throw new Error("Informe a abertura e o fechamento no formato HH:mm");
      }

      if ((hour.opens_at as string) >= (hour.closes_at as string)) {
        throw new Error("O horário de abertura deve ser antes do fechamento");
      }
    }

    await prismaClient.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user_id,
        },
        data: {
          slot_interval_minutes: Number(slot_interval_minutes),
        },
      });

      for (const hour of hours) {
        await tx.businessHour.upsert({
          where: {
            user_id_weekday: {
              user_id,
              weekday: Number(hour.weekday),
            },
          },
          update: {
            closed: Boolean(hour.closed),
            opens_at: hour.closed ? null : hour.opens_at,
            closes_at: hour.closed ? null : hour.closes_at,
          },
          create: {
            user_id,
            weekday: Number(hour.weekday),
            closed: Boolean(hour.closed),
            opens_at: hour.closed ? null : hour.opens_at,
            closes_at: hour.closed ? null : hour.closes_at,
          },
        });
      }
    });

    const updated = await prismaClient.user.findFirst({
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

    return {
      slug: updated?.slug,
      slot_interval_minutes: updated?.slot_interval_minutes,
      hours: updated?.businessHours || [],
    };
  }
}

export { UpdateBusinessHoursService };
