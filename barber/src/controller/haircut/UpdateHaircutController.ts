import { Request, Response } from "express";
import { UpdateHaircut } from "../../service/haircut/UpdateHaircutService";

class UpdateHaircutController {
  async handle(request: Request, response: Response) {
    const user_id = request.user_id;
    const { haircut_id, name, price, status } = request.body;

    const update = new UpdateHaircut();

    const haircut = await update.execute({
      user_id,
      haircut_id,
      name,
      price,
      status,
    });

    return response.json(haircut);
  }
}

export { UpdateHaircutController };
