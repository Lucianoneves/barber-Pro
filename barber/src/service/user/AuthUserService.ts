import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import prismaClient from "../../prisma";
import { syncUserSubscription } from "../../utils/manageSubscription";

interface AuthUserRequest {
  // interface para os dados do usuario
  email: string;
  password: string;
}

class AuthUserService {
  async execute({ email, password }: AuthUserRequest) {
    const user = await prismaClient.user.findFirst({
      // busca o usuario no banco de dados
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      include: {
        subscriptions: true,
      },
    });

    if (!user) {
      throw new Error("Email/password incorrect");
    }

    const passwordMatch = await compare(password, user?.password);

    if (!passwordMatch) {
      throw new Error("Email/password incorrect");
    }

    try {
      await syncUserSubscription(user.id);
    } catch (error) {
      console.log("Erro ao sincronizar assinatura: ", error);
    }

    const subscriptions = await prismaClient.subscription.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    const token = sign(
      // gerar o token
      {
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET, // secret do token
      {
        subject: user.id, // id do usuario
        expiresIn: "30d", // 30 dias para de valer o token
      }
    );

    return {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      endereco: user?.endereco,
      token: token,
      subscriptions: subscriptions
        ? {
            id: subscriptions.id,
            status: subscriptions.status,
          }
        : null,
    };
  }
}

export { AuthUserService };
