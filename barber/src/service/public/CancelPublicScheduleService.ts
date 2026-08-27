import prismaClient from "../../prisma";
import { isValidPhone, normalizePhone } from "../../utils/phone";

interface CancelPublicScheduleRequest {
  slug: string;
  phone: string;
  schedule_id: string;
}

class CancelPublicScheduleService {
  async execute({ slug, phone, schedule_id }: CancelPublicScheduleRequest) {
    const customerPhone = normalizePhone(phone);

    if (!isValidPhone(customerPhone) || !schedule_id) {
      throw new Error("Informe o telefone e o agendamento");
    }

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

    const customer = await prismaClient.customer.findUnique({
      where: {
        user_id_phone: {
          user_id: shop.id,
          phone: customerPhone,
        },
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new Error("Cliente não encontrado nesta barbearia");
    }

    const schedule = await prismaClient.service.findFirst({
      where: {
        id: schedule_id,
        user_id: shop.id,
        customer_id: customer.id,
      },
    });

    if (!schedule) {
      throw new Error("Agendamento não encontrado");
    }

    if (schedule.scheduled_at.getTime() <= Date.now()) {
      throw new Error("Não é possível cancelar um horário passado");
    }

    await prismaClient.service.delete({
      where: {
        id: schedule.id,
      },
    });

    return {
      message: "Agendamento cancelado",
    };
  }
}

export { CancelPublicScheduleService };
