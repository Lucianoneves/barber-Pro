import { Request, Response } from "express";
import { UpdateSubscriptionService } from "../../service/subscription/UpdateSubscriptionService";

class UpdateSubscriptionController {
  async handle(request: Request, response: Response) {
    const user_id = request.user_id;
    const { status, price_id } = request.body;

    const updateSubscriptionService = new UpdateSubscriptionService();

    const subscription = await updateSubscriptionService.execute({
      user_id,
      status,
      price_id,
    });

    return response.json(subscription);
  }
}

export { UpdateSubscriptionController };
