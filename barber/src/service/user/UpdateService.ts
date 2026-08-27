import prismaClient from "../../prisma";

interface UserRequest {
  user_id: string;
  name: string;

  endereco: string;
}

class UpdateService {
  async execute({ user_id, name, endereco }: UserRequest) {
    try {
      const userAlreadyExists = await prismaClient.user.findFirst({
        where: {
          id: user_id,
        },
      });

      if (!userAlreadyExists) {
        throw new Error("Usuario nao encontrado");
      }

      const userUpdated = await prismaClient.user.update({
        where: {
          id: user_id,
        },
        data: {
          name: name,
          endereco: endereco,
        },
        select: {
          name: true,
          email: true,
          endereco: true,
        },
      });
      return userUpdated;
    } catch (err) {
      throw new Error("Erro ao atualizar usuario");
    }
  }
}

export { UpdateService };
