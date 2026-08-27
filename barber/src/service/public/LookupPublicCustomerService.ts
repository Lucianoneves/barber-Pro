import prismaClient from "../../prisma";
import { isValidPhone, normalizePhone } from "../../utils/phone";

interface LookupPublicCustomerRequest {
  slug: string;
  phone: string;
}

class LookupPublicCustomerService {
  async execute({ slug, phone }: LookupPublicCustomerRequest) {
    const customerPhone = normalizePhone(phone);

    if (!isValidPhone(customerPhone)) {
      return {
        exists: false,
        name: null,
        schedules: [],
      };
    }

    const shop = await prismaClient.user.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!shop) {
      throw new Error("Barbearia não encontrada");
    }

    const customer = await prismaClient.customer.findUnique({
      where: {
        user_id_phone: {
          user_id: shop.id,
          phone: customerPhone,
        },
      },
      select: {
        name: true,
        services: {
          where: {
            scheduled_at: {
              gte: new Date(),
            },
          },
          select: {
            id: true,
            scheduled_at: true,
            haircut: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
          orderBy: {
            scheduled_at: "asc",
          },
        },
      },
    });

    if (!customer) {
      return {
        exists: false,
        name: null,
        schedules: [],
      };
    }

    return {
      exists: true,
      name: customer.name,
      schedules: customer.services.map((item) => ({
        id: item.id,
        scheduled_at: item.scheduled_at.toISOString(),
        haircut: item.haircut,
      })),
    };
  }
}

export { LookupPublicCustomerService };
