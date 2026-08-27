import prismaClient from "../../prisma";

interface ListScheduleRequest {
  user_id: string;
}

class ListScheduleService {
  async execute({ user_id }: ListScheduleRequest) {
    const schedules = await prismaClient.service.findMany({
      where: {
        user_id: user_id,
      },
      select: {
        id: true,
        customer: true,
        scheduled_at: true,
        source: true,
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        haircut: true,
      },
      orderBy: {
        scheduled_at: "asc",
      },
    });
    return schedules;
  }
}

export { ListScheduleService };
