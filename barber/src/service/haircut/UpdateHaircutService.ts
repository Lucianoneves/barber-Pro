import prismaClient from "../../prisma";

interface HaircutRequest {
  user_id: string;
  haircut_id: string;
  name: string;
  price: number;
  status: boolean | string;
}

class UpdateHaircut {
  async execute({
    user_id,
    haircut_id,
    name,
    price,
    status = true,
  }: HaircutRequest) {
    const haircutExists = await prismaClient.haircut.findFirst({
      where: {
        id: haircut_id,
        user_id,
      },
    });

    if (!haircutExists) {
      throw new Error("Corte não encontrado");
    }

    const haircut = await prismaClient.haircut.update({
      where: {
        id: haircut_id,
      },
      data: {
        name,
        price,
        status: status === true || status === "true",
      },
    });

    return haircut;
  }
}

export { UpdateHaircut };
