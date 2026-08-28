import { Prisma } from "@prisma/client";
import prismaClient from "../../prisma";
import { ListAvailableSlotsService } from "../schedule/ListAvailableSlotsService";
import { signCustomerToken } from "../../utils/customerToken";
import {
  isSameSlot,
  normalizeSlotDate,
  toLocalDateInput,
} from "../../utils/scheduleSlots";

interface UpdatePublicScheduleRequest {
  shop_id: string;
  slug: string;
  customer_id: string;
  schedule_id: string;
  haircut_id: string;
  scheduled_at: string;
}

class UpdatePublicScheduleService {
  async execute({
    shop_id,
    slug,
    customer_id,
    schedule_id,
    haircut_id,
    scheduled_at,
  }: UpdatePublicScheduleRequest) {
    if (!schedule_id || !customer_id) {
      throw new Error("Agendamento não encontrado");
    }

    const scheduledDate = normalizeSlotDate(new Date(scheduled_at));

    if (Number.isNaN(scheduledDate.getTime())) {
      throw new Error("Data ou horário inválido");
    }

    if (scheduledDate.getTime() <= Date.now()) {
      throw new Error("Não é possível agendar em um horário passado");
    }

    const haircut = await prismaClient.haircut.findFirst({
      where: {
        id: haircut_id,
        user_id: shop_id,
      },
    });

    if (!haircut) {
      throw new Error("Corte inválido para esta barbearia");
    }

    const schedule = await prismaClient.service.findFirst({
      where: {
        id: schedule_id,
        user_id: shop_id,
        customer_id,
      },
    });

    if (!schedule) {
      throw new Error("Agendamento não encontrado");
    }

    if (schedule.scheduled_at.getTime() <= Date.now()) {
      throw new Error("Não é possível alterar um horário passado");
    }

    const day = await new ListAvailableSlotsService().executeDay({
      user_id: shop_id,
      date: toLocalDateInput(scheduledDate),
      ignore_schedule_id: schedule_id,
    });

    if (day.closed) {
      throw new Error("A barbearia não abre neste dia");
    }

    const matchingSlot = day.slots.find((slot) =>
      isSameSlot(slot.at, scheduledDate)
    );

    if (!matchingSlot) {
      throw new Error("Data ou horário inválido");
    }

    if (matchingSlot.status !== "available") {
      throw new Error(
        "Esse horário já está ocupado, independente do tipo de corte"
      );
    }

    try {
      const updated = await prismaClient.service.update({
        where: {
          id: schedule.id,
        },
        data: {
          haircut_id,
          scheduled_at: scheduledDate,
        },
        include: {
          haircut: true,
        },
      });

      return {
        ...updated,
        access_token: signCustomerToken({
          customer_id,
          shop_id,
          slug,
        }),
      };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error(
          "Esse horário já está ocupado, independente do tipo de corte"
        );
      }

      throw err;
    }
  }
}

export { UpdatePublicScheduleService };
