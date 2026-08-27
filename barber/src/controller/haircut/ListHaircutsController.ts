import { Request, Response } from "express";
import { ListHaircutsService } from "../../service/haircut/ListHaircutsService";

class ListHaircutsController {
  async handle(request: Request, response: Response) {
    const user_id = request.user_id;
    const status = request.query.status as string;

    const listHaircutsService = new ListHaircutsService();

    const haircuts = await listHaircutsService.execute({
      user_id,
      status,
    });

    return response.json(haircuts);
  }
}

export { ListHaircutsController };
