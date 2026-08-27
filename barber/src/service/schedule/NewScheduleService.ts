import { Prisma } from "@prisma/client";
import prismaClient from "../../prisma";
import { EnsureCustomerService } from "../customer/EnsureCustomerService";
import { ListAvailableSlotsService } from "./ListAvailableSlotsService";
import {
  isSameSlot,
  normalizeSlotDate,
  toLocalDateInput,
} from "../../utils/scheduleSlots";

interface NewScheduleRequest {
  user_id: string;
  haircut_id: string;
  customer: string;
  phone: string;
  scheduled_at: string;
  source?: string;
  ignore_schedule_id?: string;
}

class NewScheduleService {
  async execute({
    user_id,
    haircut_id,
    customer,
    phone,
    scheduled_at,
    source = "shop",
    ignore_schedule_id,
  }: NewScheduleRequest) {
    if (customer === "" || haircut_id === "") {
      throw new Error("Erro ao criar agendamento");
    }

    if (!scheduled_at) {
      throw new Error("Informe a data e o horário do agendamento");
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
        user_id,
        status: true,
      },
    });

    if (!haircut) {
      throw new Error("Corte inválido para esta barbearia");
    }

    const date = toLocalDateInput(scheduledDate);
    const day = await new ListAvailableSlotsService().executeDay({
      user_id,
      date,
      ignore_schedule_id,
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

    const overlapping = await prismaClient.service.findFirst({
      where: {
        user_id,
        scheduled_at: scheduledDate,
        ...(ignore_schedule_id
          ? {
              id: {
                not: ignore_schedule_id,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (overlapping) {
      throw new Error(
        "Esse horário já está ocupado, independente do tipo de corte"
      );
    }

    const client = await new EnsureCustomerService().execute({
      user_id,
      name: customer,
      phone,
    });

    try {
      const schedule = await prismaClient.service.create({
        data: {
          customer: client.name,
          customer_id: client.id,
          haircut_id,
          user_id,
          scheduled_at: scheduledDate,
          source,
        },
        include: {
          haircut: true,
          client: true,
        },
      });

      return schedule;
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

export { NewScheduleService };
