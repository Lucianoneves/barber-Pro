import prismaClient from "../../prisma";

class ListPublicShopsService {
  async execute() {
    const shops = await prismaClient.user.findMany({
      where: {
        haircuts: {
          some: {
            status: true,
          },
        },
      },
      select: {
        name: true,
        slug: true,
        endereco: true,
        _count: {
          select: {
            haircuts: {
              where: {
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return shops.map((shop) => ({
      name: shop.name,
      slug: shop.slug,
      endereco: shop.endereco,
      haircuts_count: shop._count.haircuts,
    }));
  }
}

export { ListPublicShopsService };
