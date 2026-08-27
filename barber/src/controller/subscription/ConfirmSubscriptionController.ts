import { Request, Response } from "express";
import { ConfirmSubscriptionService } from "../../service/subscription/ConfirmSubscriptionService";

class ConfirmSubscriptionController {
  async handle(request: Request, response: Response) {
    const user_id = request.user_id;
    const { session_id } = request.body as { session_id?: string };

    const confirmSubscriptionService = new ConfirmSubscriptionService();

    const subscription = await confirmSubscriptionService.execute({
      user_id,
      session_id,
    });

    return response.json(subscription);
  }
}

export { ConfirmSubscriptionController };
