import { Request, Response } from "express";
import { CreatePublicScheduleService } from "../../service/public/CreatePublicScheduleService";

class CreatePublicScheduleController {
  async handle(req: Request, res: Response) {
    const { slug, customer, phone, haircut_id, scheduled_at } = req.body;
    const schedule = await new CreatePublicScheduleService().execute({
      slug,
      customer,
      phone,
      haircut_id,
      scheduled_at,
    });
    return res.json(schedule);
  }
}

export { CreatePublicScheduleController };
