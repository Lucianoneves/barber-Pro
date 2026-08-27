import { Request, Response } from "express";
import { CreateSubscriptionService } from "../../service/subscription/CreateSubscriptionService";

class CreateSubscriptionController {
  async handle(request: Request, response: Response) {
    const user_id = request.user_id;

    const createSubscriptionService = new CreateSubscriptionService();

    const subscription = await createSubscriptionService.execute({
      user_id,
    });

    return response.json(subscription);
  }
}

export { CreateSubscriptionController };
