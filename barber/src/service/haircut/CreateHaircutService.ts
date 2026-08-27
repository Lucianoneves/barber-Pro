import prismaClient from "../../prisma";

interface HaircutRequest {
  user_id: string;
  name: string;
  price: number;
}

//Verificar quantos cortes o usuario tem cadastrado
//Verificar se ele e premium  se tem limites e quantidade de modeleo para cadastrar

class CreateHaircutService {
  async execute({ user_id, name, price }: HaircutRequest) {
    if (!name?.trim()) {
      throw new Error("Nome do corte é obrigatório");
    }

    const parsedPrice = Number(String(price).replace(",", "."));

    if (!parsedPrice || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      throw new Error("Preço inválido");
    }

    const myHaircuts = await prismaClient.haircut.count({
      where: {
        user_id,
      },
    });

    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
      include: {
        subscriptions: true,
      },
    });

    if (myHaircuts >= 3 && user?.subscriptions?.status !== "active") {
      throw new Error("Não autorizado para cadastrar mais de 3 cortes");
    }

    const haircut = await prismaClient.haircut.create({
      data: {
        name,
        price: parsedPrice,
        user_id,
        status: true,
      },
    });

    return haircut;
  }
}

export { CreateHaircutService };
