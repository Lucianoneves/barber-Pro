import prismaClient from "../../prisma";
import { NewScheduleService } from "../schedule/NewScheduleService";

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
      },
    });

    if (!shop) {
      throw new Error("Barbearia não encontrada");
    }

    const schedule = await new NewScheduleService().execute({
      user_id: shop.id,
      haircut_id,
      customer,
      phone,
      scheduled_at,
      source: "client",
    });

    return {
      id: schedule.id,
      customer: schedule.customer,
      scheduled_at: schedule.scheduled_at,
      shop_name: shop.name,
      haircut: schedule.haircut,
    };
  }
}

export { CreatePublicScheduleService };
