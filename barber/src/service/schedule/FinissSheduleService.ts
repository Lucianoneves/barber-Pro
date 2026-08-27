import prismaClient from "../../prisma";

interface FinisRequest {
  schedule_id: string;
  user_id: string;
}

class FinissSheduleService {
  async execute({ schedule_id, user_id }: FinisRequest) {
    if (schedule_id === "" || user_id === "") {
      throw new Error("Invalid schedule or user");
    }

    try {
      const belongsToUser = await prismaClient.service.findFirst({
        where: {
          id: schedule_id, // id do agendamento
          user_id: user_id, // id do usuario
        },
      });

      if (!belongsToUser) {
        throw new Error("Agendamento não Aturozido");
      }

      await prismaClient.service.delete({
        where: {
          id: schedule_id, // id do agendamento
        },
      });

      return { message: "Agendamento deletado  com sucesso" };
    } catch (err) {
      console.log(err);
      throw new Error("Error to finish schedule");
    }
  }
}

export { FinissSheduleService };
