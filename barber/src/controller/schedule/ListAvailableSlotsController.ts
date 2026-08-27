import { Request, Response } from "express";
import { ListAvailableSlotsService } from "../../service/schedule/ListAvailableSlotsService";

class ListAvailableSlotsController {
  async handle(req: Request, res: Response) {
    const user_id = req.user_id;
    const date = String(req.query.date || "");
    const listSlots = new ListAvailableSlotsService();
    const slots = await listSlots.execute({ user_id, date });

    return res.json(slots.map((slot) => slot.toISOString()));
  }
}

export { ListAvailableSlotsController };
