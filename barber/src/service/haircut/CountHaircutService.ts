import prismaClient from "../../prisma";

interface CountHaircut {
  user_id: string;
}

class CountHaircutService {
  async execute({ user_id }: CountHaircut) {
    const count = await prismaClient.haircut.count({
      where: {
        user_id,
      },
    });

    return { count };
  }
}

export { CountHaircutService };
