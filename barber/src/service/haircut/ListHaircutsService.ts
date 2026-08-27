import prismaClient from "../../prisma";

interface HaircutRequest {
  user_id: string;
  status?: boolean | string;
}

class ListHaircutsService {
  async execute({ user_id, status }: HaircutRequest) {
    const haircuts = await prismaClient.haircut.findMany({
      where: {
        user_id,
        ...(status !== undefined &&
          status !== "" && {
            status: status === "true" || status === true,
          }),
      },
    });

    return haircuts;
  }
}

export { ListHaircutsService };
