import { Request, Response } from "express";
import { ListPublicSlotsService } from "../../service/public/ListPublicSlotsService";

class ListPublicSlotsController {
  async handle(req: Request, res: Response) {
    const { slug } = req.params;
    const date = String(req.query.date || "");
    const ignore_schedule_id = String(req.query.ignore_schedule_id || "");
    const slots = await new ListPublicSlotsService().execute({
      slug,
      date,
      ignore_schedule_id: ignore_schedule_id || undefined,
    });
    return res.json(slots);
  }
}

export { ListPublicSlotsController };
