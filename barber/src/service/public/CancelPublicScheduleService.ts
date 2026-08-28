import prismaClient from "../../prisma";

interface CancelPublicScheduleRequest {
  shop_id: string;
  customer_id: string;
  schedule_id: string;
}

class CancelPublicScheduleService {
  async execute({
    shop_id,
    customer_id,
    schedule_id,
  }: CancelPublicScheduleRequest) {
    if (!schedule_id || !customer_id) {
      throw new Error("Informe o agendamento");
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
