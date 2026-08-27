import { Prisma } from "@prisma/client";
import prismaClient from "../../prisma";
import { EnsureCustomerService } from "../customer/EnsureCustomerService";
import { ListAvailableSlotsService } from "../schedule/ListAvailableSlotsService";
import { isValidPhone, normalizePhone } from "../../utils/phone";
import {
  isSameSlot,
  normalizeSlotDate,
  toLocalDateInput,
} from "../../utils/scheduleSlots";

interface UpdatePublicScheduleRequest {
  slug: string;
  phone: string;
  customer: string;
  schedule_id: string;
  haircut_id: string;
  scheduled_at: string;
}

class UpdatePublicScheduleService {
  async execute({
    slug,
    phone,
    customer,
    schedule_id,
    haircut_id,
    scheduled_at,
  }: UpdatePublicScheduleRequest) {
    const shop = await prismaClient.user.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!shop) {
      throw new Error("Barbearia não encontrada");
    }

    const customerPhone = normalizePhone(phone);

    if (!isValidPhone(customerPhone) || !schedule_id) {
      throw new Error("Informe o telefone e o agendamento");
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
        user_id: shop.id,
        status: true,
      },
    });

    if (!haircut) {
      throw new Error("Corte inválido para esta barbearia");
    }

    const client = await new EnsureCustomerService().execute({
      user_id: shop.id,
      name: customer,
      phone: customerPhone,
    });

    const schedule = await prismaClient.service.findFirst({
      where: {
        id: schedule_id,
        user_id: shop.id,
        customer_id: client.id,
      },
    });

    if (!schedule) {
      throw new Error("Agendamento não encontrado");
    }

    if (schedule.scheduled_at.getTime() <= Date.now()) {
      throw new Error("Não é possível alterar um horário passado");
    }

    const day = await new ListAvailableSlotsService().executeDay({
      user_id: shop.id,
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
      return await prismaClient.service.update({
        where: {
          id: schedule.id,
        },
        data: {
          customer: client.name,
          haircut_id,
          scheduled_at: scheduledDate,
        },
        include: {
          haircut: true,
        },
      });
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
