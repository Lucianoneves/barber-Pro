import { Request, Response } from "express";
import { ListAvailableSlotsService } from "../../service/schedule/ListAvailableSlotsService";

class ListAvailableSlotsController {
  async handle(req: Request, res: Response) {
    const user_id = req.user_id;
    const date = String(req.query.date || "");
    const listSlots = new ListAvailableSlotsService();
    const day = await listSlots.executeDay({ user_id, date });

    return res.json({
      closed: day.closed,
      slots: day.slots.map((slot) => ({
        at: slot.at.toISOString(),
        status: slot.status,
      })),
    });
  }
}

export { ListAvailableSlotsController };
