import prismaClient from "../../prisma";
import { namesMatch } from "../../utils/personName";
import { signCustomerToken } from "../../utils/customerToken";
import { isValidPhone, normalizePhone } from "../../utils/phone";
import { ListOwnPublicSchedulesService } from "./ListOwnPublicSchedulesService";

interface CreateCustomerAccessRequest {
  slug: string;
  phone: string;
  name: string;
}

class CreateCustomerAccessService {
  async execute({ slug, phone, name }: CreateCustomerAccessRequest) {
    const customerPhone = normalizePhone(phone);
    const customerName = (name || "").trim();

    if (!isValidPhone(customerPhone) || !customerName) {
      throw new Error("Informe o telefone e o nome");
    }

    const shop = await prismaClient.user.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
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
        name: true,
        phone: true,
      },
    });

    if (!customer) {
      return {
        exists: false,
        token: null,
        name: null,
        phone: customerPhone,
        schedules: [],
      };
    }

    if (!namesMatch(customer.name, customerName)) {
      throw new Error(
        "Telefone ou nome não conferem com o cadastro desta barbearia"
      );
    }

    const token = signCustomerToken({
      customer_id: customer.id,
      shop_id: shop.id,
      slug: shop.slug,
    });

    const schedules = await new ListOwnPublicSchedulesService().execute({
      customer_id: customer.id,
      shop_id: shop.id,
    });

    return {
      exists: true,
      token,
      name: customer.name,
      phone: customer.phone,
      schedules,
    };
  }
}

export { CreateCustomerAccessService };
