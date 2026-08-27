import { Request, Response } from "express";
import { DetailSubscriptionService } from "../../service/subscription/DetailSubscriptionService";

class DetailSubscriptionController {
  async handle(request: Request, response: Response) {
    const user_id = request.user_id;

    const detailSubscriptionService = new DetailSubscriptionService();

    const subscription = await detailSubscriptionService.execute(user_id);

    return response.json(subscription);
  }
}

export { DetailSubscriptionController };
