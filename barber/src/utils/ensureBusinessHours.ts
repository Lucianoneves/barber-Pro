import prismaClient from "../prisma";
import { getDefaultBusinessHours } from "./defaultBusinessHours";

export async function ensureBusinessHours(user_id: string) {
  const count = await prismaClient.businessHour.count({
    where: {
      user_id,
    },
  });

  if (count > 0) {
    return;
  }

  await prismaClient.businessHour.createMany({
    data: getDefaultBusinessHours().map((item) => ({
      ...item,
      user_id,
    })),
  });
}
