import prismaClient from "../../prisma";
import { hash } from "bcryptjs";
import { slugify } from "../../utils/slug";
import { getDefaultBusinessHours } from "../../utils/defaultBusinessHours";

interface UserRequest {
  // interface para os dados do usuario
  name: string;
  email: string;
  password: string;
  endereco?: string;
}

class CreateUserService {
  async execute({ name, email, password, endereco }: UserRequest) {
    // desestruturando os dados do usuario

    if (!email) {
      throw new Error("Email incorreto");
    }

    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (userAlreadyExists) {
      throw new Error("Usuario/Email  ja existe");
    }
    const passwordHash = await hash(password, 8); // hashando a senha
    const slug = await this.createUniqueSlug(name);

    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        endereco,
        slug,
        businessHours: {
          create: getDefaultBusinessHours(),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        endereco: true,
        slug: true,
      },
    });

    return user;
  }

  private async createUniqueSlug(name: string) {
    const base = slugify(name);
    let slug = base;
    let suffix = 2;

    while (await prismaClient.user.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }
}

export { CreateUserService };
