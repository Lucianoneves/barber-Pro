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
}

class NewScheduleService {
  async execute({
    user_id,
    haircut_id,
    customer,
    phone,
    scheduled_at,
    source = "shop",
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
    const slots = await new ListAvailableSlotsService().execute({
      user_id,
      date,
    });

    const slotIsFree = slots.some((slot) => isSameSlot(slot, scheduledDate));

    if (!slotIsFree) {
      throw new Error("Esse horário não está disponível");
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
        throw new Error("Esse horário acabou de ser ocupado");
      }

      throw err;
    }
  }
}

export { NewScheduleService };
