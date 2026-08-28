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
        id: true,
      },
    });

    return {
      exists: Boolean(customer),
    };
  }
}

export { LookupPublicCustomerService };
