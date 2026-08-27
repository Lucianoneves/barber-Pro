import { Request, Response } from "express";
import { CancelPublicScheduleService } from "../../service/public/CancelPublicScheduleService";

class CancelPublicScheduleController {
  async handle(req: Request, res: Response) {
    const { slug, phone, schedule_id } = req.body;
    const result = await new CancelPublicScheduleService().execute({
      slug,
      phone,
      schedule_id,
    });
    return res.json(result);
  }
}

export { CancelPublicScheduleController };
