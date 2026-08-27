import { Request, Response } from "express";
import { UpdateBusinessHoursService } from "../../service/hours/UpdateBusinessHoursService";

class UpdateBusinessHoursController {
  async handle(req: Request, res: Response) {
    const user_id = req.user_id;
    const { slot_interval_minutes, hours } = req.body;
    const updateHours = new UpdateBusinessHoursService();
    const updated = await updateHours.execute({
      user_id,
      slot_interval_minutes,
      hours,
    });

    return res.json(updated);
  }
}

export { UpdateBusinessHoursController };
