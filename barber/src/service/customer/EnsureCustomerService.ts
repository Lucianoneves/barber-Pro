import prismaClient from "../../prisma";
import { isValidPhone, normalizePhone } from "../../utils/phone";

interface EnsureCustomerRequest {
  user_id: string;
  name: string;
  phone: string;
}

class EnsureCustomerService {
  async execute({ user_id, name, phone }: EnsureCustomerRequest) {
    const customerName = name.trim();
    const customerPhone = normalizePhone(phone);

    if (!customerName) {
      throw new Error("Informe o nome do cliente");
    }

    if (!isValidPhone(customerPhone)) {
      throw new Error("Informe um telefone válido");
    }

    const customer = await prismaClient.customer.upsert({
      where: {
        user_id_phone: {
          user_id,
          phone: customerPhone,
        },
      },
      update: {
        name: customerName,
      },
      create: {
        name: customerName,
        phone: customerPhone,
        user_id,
      },
    });

    return customer;
  }
}

export { EnsureCustomerService };
