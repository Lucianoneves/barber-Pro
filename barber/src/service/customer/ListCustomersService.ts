import prismaClient from "../../prisma";

interface ListCustomersRequest {
  user_id: string;
}

class ListCustomersService {
  async execute({ user_id }: ListCustomersRequest) {
    const customers = await prismaClient.customer.findMany({
      where: {
        user_id,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        services: {
          select: {
            scheduled_at: true,
            haircut: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            scheduled_at: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      createdAt: customer.createdAt,
      last_schedule: customer.services[0] || null,
    }));
  }
}

export { ListCustomersService };
