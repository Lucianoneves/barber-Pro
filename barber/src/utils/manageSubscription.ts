import { stripe } from "./stripe";
import prismaClient from "../prisma";

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false,
  deleteAction = false
) {
  const findUser = await prismaClient.user.findFirst({
    where: {
      stripe_customer_id: customerId,
    },
    include: {
      subscriptions: true,
    },
  });

  if (!findUser) {
    throw new Error(`Usuário não encontrado para o customer ${customerId}`);
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const price = subscription.items.data[0]?.price;
  const priceId = stripeId(price);

  if (!priceId) {
    throw new Error("Preço da assinatura não encontrado no Stripe");
  }

  const subscriptionData = {
    id: subscription.id,
    userId: findUser.id,
    status: subscription.status,
    price_id: priceId,
  };

  if (deleteAction) {
    await prismaClient.subscription.deleteMany({
      where: {
        userId: findUser.id,
      },
    });
    return;
  }

  if (findUser.subscriptions) {
    await prismaClient.subscription.update({
      where: {
        userId: findUser.id,
      },
      data: {
        status: subscription.status,
        price_id: priceId,
      },
    });
    return;
  }

  if (createAction || !findUser.subscriptions) {
    await prismaClient.subscription.create({
      data: subscriptionData,
    });
  }
}

export async function syncUserSubscription(userId: string) {
  const user = await prismaClient.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      subscriptions: true,
    },
  });

  if (!user?.stripe_customer_id) {
    return user?.subscriptions ?? null;
  }

  if (user.subscriptions?.status === "active") {
    return user.subscriptions;
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripe_customer_id,
    status: "all",
    limit: 10,
  });

  const subscription =
    subscriptions.data.find(
      (item) => item.status === "active" || item.status === "trialing"
    ) || subscriptions.data[0];

  if (!subscription) {
    return user.subscriptions;
  }

  await saveSubscription(subscription.id, user.stripe_customer_id, true, false);

  return prismaClient.subscription.findFirst({
    where: {
      userId,
    },
  });
}
