import { Request, Response } from "express";
import { UpdatePublicScheduleService } from "../../service/public/UpdatePublicScheduleService";

class UpdatePublicScheduleController {
  async handle(req: Request, res: Response) {
    const { slug, phone, customer, schedule_id, haircut_id, scheduled_at } =
      req.body;
    const schedule = await new UpdatePublicScheduleService().execute({
      slug,
      phone,
      customer,
      schedule_id,
      haircut_id,
      scheduled_at,
    });
    return res.json(schedule);
  }
}

export { UpdatePublicScheduleController };
