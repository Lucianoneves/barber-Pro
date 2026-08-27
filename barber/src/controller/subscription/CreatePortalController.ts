import { Request, Response } from "express";
import { CreatePortalService } from "../../service/subscription/CreatePortalService";

class CreatePortalController {
  async handle(request: Request, response: Response) {
    const user_id = request.user_id;

    const createPortalService = new CreatePortalService();

    const portal = await createPortalService.execute({
      userId: user_id,
    });

    return response.json(portal);
  }
}

export { CreatePortalController };
