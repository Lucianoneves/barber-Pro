import { Request, Response } from "express";
import { ListPublicSlotsService } from "../../service/public/ListPublicSlotsService";

class ListPublicSlotsController {
  async handle(req: Request, res: Response) {
    const { slug } = req.params;
    const date = String(req.query.date || "");
    const slots = await new ListPublicSlotsService().execute({ slug, date });
    return res.json(slots);
  }
}

export { ListPublicSlotsController };
