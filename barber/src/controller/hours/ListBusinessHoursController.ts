import { Request, Response } from "express";
import { ListBusinessHoursService } from "../../service/hours/ListBusinessHoursService";

class ListBusinessHoursController {
  async handle(req: Request, res: Response) {
    const user_id = req.user_id;
    const listHours = new ListBusinessHoursService();
    const hours = await listHours.execute({ user_id });

    return res.json(hours);
  }
}

export { ListBusinessHoursController };
