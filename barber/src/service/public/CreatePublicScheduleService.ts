import prismaClient from "../../prisma";
import { NewScheduleService } from "../schedule/NewScheduleService";
import { signCustomerToken } from "../../utils/customerToken";
import { isValidPhone, normalizePhone } from "../../utils/phone";

interface CreatePublicScheduleRequest {
  slug: string;
  customer: string;
  phone: string;
  haircut_id: string;
  scheduled_at: string;
}

class CreatePublicScheduleService {
  async execute({
    slug,
    customer,
    phone,
    haircut_id,
    scheduled_at,
  }: CreatePublicScheduleRequest) {
    const shop = await prismaClient.user.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!shop) {
      throw new Error("Barbearia não encontrada");
    }

    const customerPhone = normalizePhone(phone);

    if (!isValidPhone(customerPhone)) {
      throw new Error("Informe um telefone válido");
    }

    const schedule = await new NewScheduleService().execute({
      user_id: shop.id,
      haircut_id,
      customer,
      phone,
      scheduled_at,
      source: "client",
    });

    const access_token = schedule.client
      ? signCustomerToken({
          customer_id: schedule.client.id,
          shop_id: shop.id,
          slug: shop.slug,
        })
      : null;

    return {
      id: schedule.id,
      customer: schedule.customer,
      scheduled_at: schedule.scheduled_at,
      shop_name: shop.name,
      haircut: schedule.haircut,
      access_token,
    };
  }
}

export { CreatePublicScheduleService };
